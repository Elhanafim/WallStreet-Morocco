"""
BVC Price Microservice — wraps casabourse library.
Exposes REST endpoints consumed by the WallStreet Morocco frontend.

Run:  uvicorn main:app --host 0.0.0.0 --port 8001 --reload
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional

import pytz
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from security.sanitizer import sanitize_ticker, sanitize_tickers, looks_like_sqli
from security.audit_logger import log_security_event, SecurityEvent

load_dotenv()

import casabourse as cb  # noqa: E402  (after dotenv so env is ready)
from price_cache import PriceCache  # noqa: E402
from calendar_router import calendar_router, start_background_refresh  # noqa: E402
from chatbot.router import router as chat_router  # noqa: E402
from stocksma_fetcher import (  # noqa: E402
    get_live_price as sm_get_live_price,
    get_all_prices as sm_get_all_prices,
    get_stock_fundamentals as sm_get_fundamentals,
    get_quote_table as sm_get_quote_table,
    STOCKSMA_AVAILABLE,
)
from excel_fallback import (  # noqa: E402
    refresh_excel_prices,
    read_excel_price,
    read_excel_all_prices,
    get_excel_status,
    get_excel_path,
)

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("bvc-price")

# ── Config ────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "60"))
INSTRUMENTS_TTL = 86_400  # 24 h for the instruments list

CASABLANCA_TZ = pytz.timezone("Africa/Casablanca")
MARKET_OPEN_H, MARKET_OPEN_M = 9, 30
MARKET_CLOSE_H, MARKET_CLOSE_M = 15, 30
DELAY_MINUTES = 15  # BVC data delay

cache = PriceCache(ttl_seconds=CACHE_TTL)
instruments_cache = PriceCache(ttl_seconds=INSTRUMENTS_TTL)

# ── Market helpers ────────────────────────────────────────────────────────────

def _now_casablanca() -> datetime:
    return datetime.now(CASABLANCA_TZ)


def _is_market_open(dt: Optional[datetime] = None) -> bool:
    dt = dt or _now_casablanca()
    if dt.weekday() >= 5:  # Sat=5, Sun=6
        return False
    open_min = MARKET_OPEN_H * 60 + MARKET_OPEN_M
    close_min = MARKET_CLOSE_H * 60 + MARKET_CLOSE_M
    current_min = dt.hour * 60 + dt.minute
    return open_min <= current_min < close_min


def _next_open(dt: Optional[datetime] = None) -> datetime:
    """Return the next market-open datetime in Africa/Casablanca."""
    dt = (dt or _now_casablanca()).replace(second=0, microsecond=0)
    # Advance past any non-trading days or times
    candidate = dt.replace(hour=MARKET_OPEN_H, minute=MARKET_OPEN_M)
    if candidate <= dt or dt.weekday() >= 5:
        candidate += timedelta(days=1)
    while candidate.weekday() >= 5:
        candidate += timedelta(days=1)
    return candidate.replace(hour=MARKET_OPEN_H, minute=MARKET_OPEN_M)


def _next_close(dt: Optional[datetime] = None) -> datetime:
    dt = dt or _now_casablanca()
    if _is_market_open(dt):
        return dt.replace(hour=MARKET_CLOSE_H, minute=MARKET_CLOSE_M, second=0, microsecond=0)
    return _next_open(dt).replace(hour=MARKET_CLOSE_H, minute=MARKET_CLOSE_M)


# ── Data normalization ────────────────────────────────────────────────────────

def _safe_float(val, default: float = 0.0) -> float:
    try:
        f = float(val)
        return f if f == f else default  # NaN check
    except (TypeError, ValueError):
        return default


def _normalize_row(row: dict) -> dict:
    ticker = str(row.get("Symbole", "")).strip().upper()
    name = str(row.get("Nom", "")).strip()

    current = _safe_float(row.get("Cours courant"))
    close = _safe_float(row.get("Prix clôture"))
    last_price = current if current > 0 else close

    return {
        "ticker": ticker,
        "name": name,
        "lastPrice": last_price,
        "change": _safe_float(row.get("Différence")),
        "changePercent": _safe_float(row.get("Variation %")),
        "open": _safe_float(row.get("Ouverture")),
        "high": _safe_float(row.get("Plus haut")),
        "low": _safe_float(row.get("Plus bas")),
        "volume": _safe_float(row.get("Volume échangé")),
        "referencePrice": _safe_float(row.get("Prix référence")),
        "timestamp": str(row.get("field_last_traded_time", "")),
        "available": last_price > 0,
    }


def _fetch_and_cache_snapshot() -> list[dict]:
    """
    Fetch all market data and populate the cache.

    Fallback chain:
      Level 0: StocksMA direct (Leboursier.ma) — fastest if reachable
      Level 1: StocksMA Excel cache — persistent fallback
      Level 2: casabourse library — reliable primary
    """
    normalized: dict[str, dict] = {}
    source_used = "casabourse"

    # ── Level 0: StocksMA direct ──────────────────────────────────
    if STOCKSMA_AVAILABLE:
        try:
            sm_prices = sm_get_all_prices()
            if len(sm_prices) >= 10:
                normalized = sm_prices
                source_used = "StocksMA"
                log.info("L0 StocksMA: %d tickers", len(normalized))
        except Exception as e:
            log.debug("L0 StocksMA failed: %s", e)

    # ── Level 1: Excel cache (if L0 failed) ───────────────────────
    if not normalized:
        try:
            excel_prices = read_excel_all_prices()
            if len(excel_prices) >= 10:
                normalized = excel_prices
                source_used = "StocksMA-Excel"
                log.info("L1 Excel cache: %d tickers", len(normalized))
        except Exception as e:
            log.debug("L1 Excel fallback failed: %s", e)

    # ── Level 2: casabourse (reliable primary) ────────────────────
    if not normalized or source_used == "StocksMA-Excel":
        try:
            df = cb.get_market_data()
            records = df.to_dict(orient="records")
            cb_data: dict[str, dict] = {}
            for row in records:
                item = _normalize_row(row)
                ticker = item["ticker"]
                if ticker:
                    item["source"] = "casabourse"
                    cb_data[ticker] = item
            if cb_data:
                # Merge: casabourse wins on price fields, but don't replace L0
                if not normalized or source_used == "StocksMA-Excel":
                    normalized = cb_data
                    source_used = "casabourse"
                log.info("L2 casabourse: %d tickers", len(cb_data))
        except Exception as e:
            log.error("L2 casabourse failed: %s", e)
            if not normalized:
                raise  # all levels failed — propagate

    # ── Store in cache ────────────────────────────────────────────
    cache.set_bulk({f"PRICE:{t}": d for t, d in normalized.items()})
    snapshot_list = list(normalized.values())
    cache.set("SNAPSHOT", {"data": snapshot_list, "source": source_used})

    # ── Write Excel (async-safe background write) ─────────────────
    try:
        refresh_excel_prices(normalized)
    except Exception as e:
        log.warning("Excel write failed (non-fatal): %s", e)

    log.info("Snapshot refreshed: %d tickers via %s", len(normalized), source_used)
    return snapshot_list


# ── Background refresh ────────────────────────────────────────────────────────

async def _background_refresh():
    while True:
        try:
            if _is_market_open():
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, _fetch_and_cache_snapshot)
                await asyncio.sleep(CACHE_TTL)
            else:
                # Outside market hours: sleep until next open
                now = _now_casablanca()
                nxt = _next_open(now)
                sleep_secs = max((nxt - now).total_seconds(), 60)
                log.info("Market closed. Next open at %s (sleeping %ds)", nxt, int(sleep_secs))
                await asyncio.sleep(sleep_secs)
        except asyncio.CancelledError:
            break
        except Exception as exc:
            log.error("Background refresh error: %s", exc)
            await asyncio.sleep(30)  # back-off on error


@asynccontextmanager
async def lifespan(app: FastAPI):
    price_task = asyncio.create_task(_background_refresh())
    cal_task = start_background_refresh()
    yield
    for task in (price_task, cal_task):
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


# ── App ───────────────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(title="BVC Price Service", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Request-ID"],
    expose_headers=["X-RateLimit-Remaining"],
    max_age=600,
)

app.include_router(calendar_router)
app.include_router(chat_router)

from opcvm.router import router as opcvm_router  # noqa: E402
app.include_router(opcvm_router)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
@limiter.limit("30/minute")
def health(request: Request):
    now = _now_casablanca()
    return {
        "status": "ok",
        "market_open": _is_market_open(now),
        "timestamp": now.isoformat(),
    }


@app.get("/market/status")
@limiter.limit("60/minute")
def market_status(request: Request):
    now = _now_casablanca()
    is_open = _is_market_open(now)
    return {
        "open": is_open,
        "nextOpen": _next_open(now).isoformat(),
        "nextClose": _next_close(now).isoformat(),
        "timezone": "Africa/Casablanca",
        "delayMinutes": DELAY_MINUTES,
    }


@app.get("/prices/snapshot")
@limiter.limit("60/minute")
def prices_snapshot(request: Request):
    now_ts = _now_casablanca().isoformat()

    cached = cache.get("SNAPSHOT")
    if cached:
        return {
            "data": cached["data"],
            "source": "casabourse",
            "timestamp": now_ts,
            "cached": True,
        }

    try:
        loop = asyncio.new_event_loop()
        data = loop.run_until_complete(
            asyncio.get_event_loop().run_in_executor(None, _fetch_and_cache_snapshot)
        )
        return {"data": data, "source": "casabourse", "timestamp": now_ts, "cached": False}
    except Exception:
        # Synchronous fallback
        try:
            data = _fetch_and_cache_snapshot()
            return {"data": data, "source": "casabourse", "timestamp": now_ts, "cached": False}
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail={"error": "BVC data unavailable", "detail": str(exc), "fallback": True},
            )


@app.get("/prices/batch")
@limiter.limit("60/minute")
def prices_batch(request: Request, tickers: str = Query(..., description="Comma-separated tickers, max 50")):
    # Sanitize and validate input
    if looks_like_sqli(tickers):
        ip = get_remote_address(request)
        log_security_event(SecurityEvent.SUSPICIOUS_INPUT, ip, details={"endpoint": "/prices/batch"}, severity="WARNING")
        raise HTTPException(status_code=400, detail="Invalid input")
    raw = sanitize_tickers(tickers)
    if not raw:
        raise HTTPException(status_code=400, detail="No tickers provided")
    if len(raw) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 tickers per batch")

    # Try to serve from individual cache entries first
    result: dict[str, dict] = {}
    missing: list[str] = []
    for t in raw:  # raw is already sanitized
        hit = cache.get(f"PRICE:{t}")
        if hit:
            result[t] = hit
        else:
            missing.append(t)

    # Fetch snapshot for any missing ticker
    if missing:
        try:
            _fetch_and_cache_snapshot()
            for t in missing:
                hit = cache.get(f"PRICE:{t}")
                if hit:
                    result[t] = hit
        except Exception as exc:
            log.error("Batch snapshot fetch error: %s", exc)

    now_ts = _now_casablanca().isoformat()
    return {"data": result, "timestamp": now_ts, "cached": len(missing) == 0}


@app.get("/prices/{ticker}")
@limiter.limit("120/minute")
def prices_ticker(request: Request, ticker: str):
    t = sanitize_ticker(ticker)
    if not t:
        raise HTTPException(status_code=400, detail="Invalid ticker symbol")
    if looks_like_sqli(ticker):
        ip = get_remote_address(request)
        log_security_event(SecurityEvent.SUSPICIOUS_INPUT, ip, details={"endpoint": f"/prices/{ticker}"}, severity="WARNING")
        raise HTTPException(status_code=400, detail="Invalid input")
    now_ts = _now_casablanca().isoformat()

    hit = cache.get(f"PRICE:{t}")
    if hit:
        return {**hit, "cached": True, "source": "casabourse"}

    # Cache miss — fetch the full snapshot (populates all tickers at once)
    try:
        _fetch_and_cache_snapshot()
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail={"error": "BVC data unavailable", "detail": str(exc), "fallback": True},
        )

    hit = cache.get(f"PRICE:{t}")
    if not hit:
        raise HTTPException(status_code=404, detail=f"Ticker '{t}' not found")

    return {**hit, "cached": False, "source": "casabourse", "timestamp": now_ts}


@app.get("/instruments")
def instruments():
    cached = instruments_cache.get("INSTRUMENTS")
    if cached:
        return cached

    try:
        df = cb.get_available_instrument()
        data = df.to_dict(orient="records")
        result = {"data": data, "count": len(data), "timestamp": _now_casablanca().isoformat()}
        instruments_cache.set("INSTRUMENTS", result)
        return result
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@app.get("/prices/fundamentals/{ticker}")
def prices_fundamentals(ticker: str):
    t = ticker.strip().upper()

    cache_key = f"FUNDAMENTALS:{t}"
    hit = cache.get(cache_key)
    if hit:
        return {**hit, "cached": True}

    result: dict = {"ticker": t}

    # Quote table via StocksMA/MarketWatch (works everywhere)
    qt = sm_get_quote_table(t)
    if qt:
        result["quoteTable"] = qt

    # Fundamentals from StocksMA (includes historical if leboursier.ma reachable)
    fund = sm_get_fundamentals(t)
    if fund:
        result.update({k: v for k, v in fund.items() if k not in result})

    # Live price from cache (or fetch if missing)
    price_hit = cache.get(f"PRICE:{t}")
    if not price_hit:
        try:
            _fetch_and_cache_snapshot()
            price_hit = cache.get(f"PRICE:{t}")
        except Exception:
            pass
    if price_hit:
        result["price"] = price_hit

    if len(result) <= 1:
        raise HTTPException(status_code=404, detail=f"No data found for '{t}'")

    result["timestamp"] = _now_casablanca().isoformat()
    result["cached"] = False
    cache.set(cache_key, result)
    return result


@app.get("/prices/movers")
def prices_movers():
    """Return top gainers and losers from the current snapshot."""
    cached = cache.get("SNAPSHOT")
    data: list[dict] = []

    if cached:
        data = cached.get("data", [])
    else:
        try:
            data = _fetch_and_cache_snapshot()
        except Exception as exc:
            raise HTTPException(status_code=503, detail=str(exc))

    # Sort by changePercent
    with_pct = [d for d in data if d.get("changePercent") is not None]
    sorted_asc = sorted(with_pct, key=lambda x: x.get("changePercent", 0))
    sorted_desc = sorted(with_pct, key=lambda x: x.get("changePercent", 0), reverse=True)

    return {
        "gainers": sorted_desc[:10],
        "losers": sorted_asc[:10],
        "timestamp": _now_casablanca().isoformat(),
        "total": len(data),
    }


@app.get("/prices/excel/status")
def excel_status():
    return get_excel_status()


@app.get("/prices/excel/download")
def excel_download():
    from fastapi.responses import FileResponse

    path = get_excel_path()
    if path is None:
        raise HTTPException(status_code=404, detail="Excel file not yet generated")
    return FileResponse(
        path=str(path),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="bvc_prices.xlsx",
    )
