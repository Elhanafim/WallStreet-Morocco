"""
StocksMA fetcher module.
Primary source (Level 0) for BVC stock prices and fundamentals.

Source: github.com/s0v1x/StocksMA
Data origin:
  - Live prices / session data: Leboursier.ma
  - Fundamentals / quote table: MarketWatch (works without network restrictions)

Real StocksMA API (installed version):
  sm.get_tickers()                    → prints ticker list to stdout, returns None
  sm.get_session_info(ticker)         → live session data (leboursier.ma)
  sm.get_ask_bid(ticker)              → ask/bid (leboursier.ma)
  sm.get_price_data(ticker, start)    → OHLCV history (leboursier.ma)
  sm.get_data_stock(ticker, s, e)     → extended history (leboursier.ma)
  sm.get_quote_table(ticker)          → fundamentals DataFrame (MarketWatch ✓)
  sm.get_balance_sheet(ticker)        → balance sheet (leboursier.ma)
  sm.get_income_statement(ticker)     → income statement (leboursier.ma)
  sm.get_cash_flow(ticker)            → cash flow (leboursier.ma)
  sm.get_company_info(ticker)         → company metadata (leboursier.ma)
  sm.get_isin(ticker)                 → ISIN (leboursier.ma)
  sm.get_market_status()              → market open/close (leboursier.ma)
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

# ── StocksMA import (graceful failure) ────────────────────────────────────────

try:
    import StocksMA as sm
    import pandas as pd
    STOCKSMA_AVAILABLE = True
    logger.info("StocksMA imported successfully")
except ImportError as e:
    sm = None  # type: ignore
    pd = None  # type: ignore
    STOCKSMA_AVAILABLE = False
    logger.warning("StocksMA not available: %s — falling back to casabourse", e)


# ── Public API ─────────────────────────────────────────────────────────────────

def get_live_price(ticker: str) -> Optional[dict]:
    """
    Fetch live/latest price for a single BVC ticker via StocksMA.
    Uses Leboursier.ma — may fail outside the Vercel network.
    Returns normalized PriceResult dict or None on failure.
    """
    if not STOCKSMA_AVAILABLE:
        return None

    from ticker_map import normalize_ticker
    clean = normalize_ticker(ticker)

    # Try get_session_info first (full session data)
    try:
        data = sm.get_session_info(clean)
        if data is not None:
            return _normalize_session_info(clean, data)
    except Exception as e:
        logger.debug("StocksMA session_info failed for %s: %s", clean, e)

    # Try get_ask_bid as secondary live source
    try:
        data = sm.get_ask_bid(clean)
        if data is not None:
            return _normalize_ask_bid(clean, data)
    except Exception as e:
        logger.debug("StocksMA ask_bid failed for %s: %s", clean, e)

    return None


def get_all_prices() -> dict[str, dict]:
    """
    Attempt to fetch all BVC prices via StocksMA.
    Iterates known tickers calling get_session_info.
    Returns dict keyed by ticker: { "ATW": PriceResult, ... }

    Note: This is slower than a single snapshot call.
    Prefer casabourse for full-market snapshots; use StocksMA for
    individual tickers when casabourse misses one.
    """
    if not STOCKSMA_AVAILABLE:
        return {}

    from ticker_map import ALL_BVC_TICKERS
    results: dict[str, dict] = {}
    failures = 0

    for ticker in list(ALL_BVC_TICKERS.keys())[:10]:  # probe first 10
        price = get_live_price(ticker)
        if price:
            results[ticker] = price
        else:
            failures += 1
            if failures >= 3:
                # leboursier.ma is likely unreachable — abort early
                logger.warning("StocksMA: leboursier.ma unreachable, aborting bulk fetch")
                return {}

    if results:
        # Fetch the rest if probe succeeded
        for ticker in list(ALL_BVC_TICKERS.keys())[10:]:
            price = get_live_price(ticker)
            if price:
                results[ticker] = price

    logger.info("StocksMA bulk fetch: %d/%d tickers", len(results), len(ALL_BVC_TICKERS))
    return results


def get_quote_table(ticker: str) -> Optional[dict]:
    """
    Fetch fundamental data via StocksMA get_quote_table().
    Source: MarketWatch — works reliably on all networks.

    Returns dict with P/E, EPS, Yield, Market Cap, etc. or None.
    """
    if not STOCKSMA_AVAILABLE or pd is None:
        return None

    from ticker_map import normalize_ticker
    clean = normalize_ticker(ticker)

    try:
        df = sm.get_quote_table(clean)
        if df is None or df.empty:
            return None

        # Convert DataFrame to dict: { "P/E Ratio": "15.26", "EPS": "49.48", ... }
        raw: dict[str, str] = {}
        for _, row in df.iterrows():
            key = str(row.get("Key Data", "")).strip()
            val = str(row.get("Value", "")).strip()
            if key and val and val not in ("N/A", "nan", "None", ""):
                raw[key] = val

        if not raw:
            return None

        return {
            "ticker":            clean,
            "open":              raw.get("Open"),
            "dayRange":          raw.get("Day Range"),
            "week52Range":       raw.get("52 Week Range"),
            "marketCap":         raw.get("Market Cap"),
            "sharesOutstanding": raw.get("Shares Outstanding"),
            "publicFloat":       raw.get("Public Float"),
            "beta":              raw.get("Beta"),
            "peRatio":           raw.get("P/E Ratio"),
            "eps":               raw.get("EPS"),
            "yield":             raw.get("Yield"),
            "dividend":          raw.get("Dividend"),
            "exDividendDate":    raw.get("Ex-Dividend Date"),
            "avgVolume":         raw.get("Average Volume"),
            "source":            "StocksMA (MarketWatch)",
            "timestamp":         _now_iso(),
        }

    except Exception as e:
        logger.warning("StocksMA get_quote_table failed for %s: %s", clean, e)
        return None


def get_historical(ticker: str, days: int = 30) -> Optional[list]:
    """
    Fetch historical OHLCV data for a ticker.
    Source: Leboursier.ma — may fail outside Vercel network.
    Returns list of dicts or None.
    """
    if not STOCKSMA_AVAILABLE or pd is None:
        return None

    from ticker_map import normalize_ticker
    clean = normalize_ticker(ticker)

    start = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    end = datetime.now().strftime("%Y-%m-%d")

    try:
        result = sm.get_price_data(clean, start)
        if result is None:
            return None
        if isinstance(result, pd.DataFrame):
            return result.tail(days).to_dict(orient="records")
        return list(result)[-days:] if result else None
    except Exception as e:
        logger.debug("StocksMA historical failed for %s: %s", clean, e)

    try:
        result = sm.get_data_stock(clean, start, end)
        if result is None:
            return None
        if isinstance(result, pd.DataFrame):
            return result.tail(days).to_dict(orient="records")
        return list(result)[-days:] if result else None
    except Exception as e:
        logger.debug("StocksMA data_stock failed for %s: %s", clean, e)

    return None


def get_stock_fundamentals(ticker: str) -> Optional[dict]:
    """
    Full fundamentals for a ticker: quote table + historical prices.
    Returns whatever is available; fields may be absent if sources fail.
    """
    if not STOCKSMA_AVAILABLE:
        return None

    from ticker_map import normalize_ticker, get_company_name
    clean = normalize_ticker(ticker)

    result: dict = {
        "ticker": clean,
        "name": get_company_name(clean),
        "source": "StocksMA",
        "timestamp": _now_iso(),
    }

    # Quote table (works via MarketWatch)
    qt = get_quote_table(clean)
    if qt:
        result["fundamentals"] = qt

    # Historical prices (requires leboursier.ma)
    hist = get_historical(clean, days=90)
    if hist:
        result["historical"] = hist

    # Return None only if we got absolutely nothing useful
    return result if len(result) > 4 else None


# ── Internal normalization helpers ────────────────────────────────────────────

def _normalize_session_info(ticker: str, data) -> Optional[dict]:
    """Normalize sm.get_session_info() output to standard PriceResult."""
    try:
        d = _to_dict(data)
        if not d:
            return None

        last_price = _extract_price(d, [
            "cours", "last", "lastPrice", "price", "close", "Close",
            "dernier", "current", "prixCourant", "coursCourant",
        ])
        if not last_price or last_price <= 0:
            return None

        change_pct = _extract_float(d, [
            "variation", "change", "changePercent", "var", "variationPct",
            "variationPercent", "diff_percent",
        ])
        volume = _extract_int(d, [
            "volume", "vol", "volumeEchange", "quantite", "quantity",
        ])

        return {
            "ticker":          ticker,
            "name":            str(d.get("name") or d.get("nom") or d.get("company") or ticker),
            "lastPrice":       last_price,
            "change":          change_pct,
            "changePercent":   change_pct,
            "volume":          volume,
            "open":            _extract_float(d, ["open", "ouverture", "Open"]) or last_price,
            "high":            _extract_float(d, ["high", "plusHaut", "High"]) or last_price,
            "low":             _extract_float(d, ["low", "plusBas", "Low"]) or last_price,
            "referencePrice":  _extract_float(d, ["reference", "prixRef", "referencePrice"]) or last_price,
            "timestamp":       _now_iso(),
            "source":          "StocksMA",
            "available":       True,
        }
    except Exception as e:
        logger.debug("_normalize_session_info failed for %s: %s", ticker, e)
        return None


def _normalize_ask_bid(ticker: str, data) -> Optional[dict]:
    """Normalize sm.get_ask_bid() output to standard PriceResult."""
    try:
        d = _to_dict(data)
        if not d:
            return None

        # Ask/bid gives us a mid-price estimate
        ask = _extract_float(d, ["ask", "offre", "askPrice"])
        bid = _extract_float(d, ["bid", "demande", "bidPrice"])
        last = _extract_float(d, ["last", "cours", "lastPrice"])

        price = last or ((ask + bid) / 2 if ask and bid else None)
        if not price or price <= 0:
            return None

        return {
            "ticker":         ticker,
            "name":           str(d.get("name") or ticker),
            "lastPrice":      price,
            "change":         0.0,
            "changePercent":  0.0,
            "volume":         0,
            "open":           price,
            "high":           ask or price,
            "low":            bid or price,
            "referencePrice": price,
            "timestamp":      _now_iso(),
            "source":         "StocksMA",
            "available":      True,
        }
    except Exception as e:
        logger.debug("_normalize_ask_bid failed for %s: %s", ticker, e)
        return None


def _to_dict(data) -> dict:
    if isinstance(data, dict):
        return data
    if hasattr(data, "__dict__"):
        return data.__dict__
    if hasattr(data, "to_dict"):
        return data.to_dict()
    try:
        return dict(data)
    except Exception:
        return {}


def _extract_price(d: dict, keys: list[str]) -> Optional[float]:
    for k in keys:
        v = d.get(k)
        if v is not None:
            try:
                f = float(str(v).replace(",", ".").replace("\u200f", "").strip())
                if f > 0:
                    return f
            except (ValueError, TypeError):
                continue
    return None


def _extract_float(d: dict, keys: list[str], default: float = 0.0) -> float:
    for k in keys:
        v = d.get(k)
        if v is not None:
            try:
                return float(str(v).replace(",", ".").replace("\u200f", "").strip())
            except (ValueError, TypeError):
                continue
    return default


def _extract_int(d: dict, keys: list[str], default: int = 0) -> int:
    for k in keys:
        v = d.get(k)
        if v is not None:
            try:
                return int(float(str(v).replace(",", "").replace(" ", "").strip()))
            except (ValueError, TypeError):
                continue
    return default


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
