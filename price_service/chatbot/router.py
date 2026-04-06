"""
FastAPI chatbot router — Groq / Llama 3.3 70B streaming endpoint.
Streams Server-Sent Events (SSE) to the frontend.
Injects live BVC market data into every system prompt.
"""

import asyncio
import json
import logging
import os
from datetime import datetime
from typing import Optional

import httpx
import pytz
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel

from .rate_limiter import check_rate_limit, validate_message
from .system_prompt import get_system_prompt

logger = logging.getLogger("wsm.chatbot")

router = APIRouter(prefix="/chat", tags=["chatbot"])

# ── Model config ──────────────────────────────────────────────────────────────
GROQ_MODEL  = os.getenv("CHAT_MODEL", "llama-3.3-70b-versatile")
MAX_TOKENS  = int(os.getenv("CHAT_MAX_TOKENS", "2048"))
TEMPERATURE = float(os.getenv("CHAT_TEMPERATURE", "0.4"))

# Internal base URL for fetching live market data from the price service itself
_SELF_BASE = os.getenv("PRICE_SERVICE_INTERNAL_URL", "http://127.0.0.1:8001")

_client: Optional[Groq] = None


def get_groq_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY not set. Get your free key at https://console.groq.com"
            )
        _client = Groq(api_key=api_key)
    return _client


# ── Live market context ───────────────────────────────────────────────────────

async def fetch_live_context() -> dict:
    """Fetch live BVC data to inject into the system prompt."""
    context: dict = {}

    # Market status + date/time from local clock (no HTTP needed)
    try:
        tz = pytz.timezone("Africa/Casablanca")
        now = datetime.now(tz)
        is_weekday = now.weekday() < 5
        minutes = now.hour * 60 + now.minute
        is_open = is_weekday and 570 <= minutes <= 930  # 09:30–15:30
        context["market_status"] = "OUVERT" if is_open else "FERMÉ"
        context["current_time"] = now.strftime("%H:%M")
        context["current_date"] = now.strftime("%A %d %B %Y")
    except Exception:
        context["market_status"] = "unknown"

    # Movers + market breadth + volume via the price service's own endpoints
    async with httpx.AsyncClient(timeout=4.0) as client:
        # /prices/movers → gainers, losers (top 5 each)
        try:
            resp = await client.get(f"{_SELF_BASE}/prices/movers")
            if resp.status_code == 200:
                data = resp.json()
                gainers = data.get("gainers", [])[:5]
                losers  = data.get("losers",  [])[:5]

                def _fmt_g(m: dict) -> str:
                    pct = m.get("changePercent") or 0
                    price = m.get("lastPrice") or m.get("price") or 0
                    return f"{m['ticker']} +{pct:.2f}% ({price:.2f} MAD)"

                def _fmt_l(m: dict) -> str:
                    pct = m.get("changePercent") or 0
                    price = m.get("lastPrice") or m.get("price") or 0
                    return f"{m['ticker']} {pct:.2f}% ({price:.2f} MAD)"

                g_str = ", ".join(
                    _fmt_g(m) for m in gainers
                    if m.get("ticker") and m.get("changePercent") is not None
                )
                l_str = ", ".join(
                    _fmt_l(m) for m in losers
                    if m.get("ticker") and m.get("changePercent") is not None
                )
                if g_str:
                    context["top_gainers"] = g_str
                if l_str:
                    context["top_losers"] = l_str
                # Keep legacy key for any old prompt references
                if g_str or l_str:
                    context["top_movers"] = f"Hausses: {g_str} | Baisses: {l_str}"
        except Exception as exc:
            logger.debug("[Chatbot] Live movers fetch skipped: %s", exc)

        # /prices/snapshot → market breadth, total volume, MASI if present
        try:
            resp = await client.get(f"{_SELF_BASE}/prices/snapshot")
            if resp.status_code == 200:
                snap = resp.json()
                stocks = snap.get("data", [])
                if stocks:
                    total   = len(stocks)
                    up      = sum(1 for s in stocks if (s.get("changePercent") or 0) > 0)
                    down    = sum(1 for s in stocks if (s.get("changePercent") or 0) < 0)
                    stable  = total - up - down
                    vol_sum = sum(s.get("volume") or 0 for s in stocks)

                    context["market_breadth"] = (
                        f"{up} hausses / {down} baisses / {stable} stables "
                        f"sur {total} valeurs"
                    )
                    if vol_sum > 0:
                        context["total_volume"] = f"{vol_sum / 1_000_000:.1f}M MAD"

                    # MASI may appear as a row in the snapshot
                    masi_row = next(
                        (s for s in stocks if (s.get("ticker") or "").upper() == "MASI"),
                        None,
                    )
                    if masi_row:
                        val = masi_row.get("lastPrice") or masi_row.get("close") or 0
                        pct = masi_row.get("changePercent") or 0
                        sign = "+" if pct >= 0 else ""
                        context["masi_value"] = f"{val:,.2f} ({sign}{pct:.2f}%)"
        except Exception as exc:
            logger.debug("[Chatbot] Snapshot fetch skipped: %s", exc)

    return context


# ── Schemas ───────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role:    str
    content: str


class ChatRequest(BaseModel):
    messages:         list[ChatMessage]
    language:         str  = "fr"
    currentPage:      str  = "/"
    isAuthenticated:  bool = False
    portfolioSummary: Optional[dict] = None
    marketStatus:     str  = "unknown"


# ── Streaming endpoint ────────────────────────────────────────────────────────

@router.post("/stream")
async def chat_stream(request: Request, body: ChatRequest):
    """
    Streaming chat endpoint via Server-Sent Events (SSE).
    Powered by Groq API + Llama 3.3 70B.

    SSE event types emitted:
      { "type": "token",  "content": "..." }   — incremental token
      { "type": "done" }                        — stream finished
      { "type": "error", "content": "..." }     — error message
    """
    if os.getenv("CHAT_ENABLED", "true").lower() == "false":
        raise HTTPException(status_code=503, detail="Chat service is disabled.")

    ip = getattr(request.client, "host", "0.0.0.0")

    allowed, err = check_rate_limit(ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=err)

    if not body.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    last_msg = body.messages[-1]
    valid, err = validate_message(last_msg.content)
    if not valid:
        raise HTTPException(status_code=400, detail=err)

    # Fetch live backend context, then merge with frontend-sent context
    live_ctx = await fetch_live_context()
    full_context = {
        **live_ctx,
        "current_page":      body.currentPage,
        "language":          body.language,
        "market_status":     live_ctx.get("market_status", body.marketStatus),
        "portfolio_summary": _format_portfolio(body.portfolioSummary),
    }

    system = get_system_prompt(full_context)

    messages_for_groq = [
        {"role": m.role, "content": m.content}
        for m in body.messages[-20:]
        if m.role in ("user", "assistant") and m.content.strip()
    ]

    async def generate():
        try:
            client = get_groq_client()
            stream = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    *messages_for_groq,
                ],
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE,
                top_p=0.9,
                stream=True,
            )

            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    payload = json.dumps(
                        {"type": "token", "content": delta.content},
                        ensure_ascii=False,
                    )
                    yield f"data: {payload}\n\n"
                    await asyncio.sleep(0)

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as exc:
            logger.error("Groq stream error: %s", exc)
            exc_str = str(exc).lower()
            if "rate_limit" in exc_str or "rate limit" in exc_str:
                msg = "Trop de requêtes. Attendez quelques secondes puis réessayez."
            elif "api_key" in exc_str or "authentication" in exc_str:
                msg = "Configuration du service incorrecte. Contactez l'équipe WallStreet Morocco."
            elif "model" in exc_str:
                msg = "Le modèle IA est temporairement indisponible. Réessayez dans un instant."
            elif "timeout" in exc_str or "connection" in exc_str:
                msg = "Délai dépassé. Vérifiez votre connexion et réessayez."
            else:
                msg = "Service temporairement indisponible. Réessayez dans quelques secondes."
            yield f"data: {json.dumps({'type': 'error', 'content': msg}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":     "no-cache, no-store",
            "Connection":        "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── Health check ──────────────────────────────────────────────────────────────

@router.get("/health")
async def chat_health():
    has_key = bool(os.getenv("GROQ_API_KEY"))
    enabled = os.getenv("CHAT_ENABLED", "true").lower() != "false"
    return {
        "status":    "ok" if (has_key and enabled) else "degraded",
        "provider":  "Groq",
        "model":     GROQ_MODEL,
        "max_tokens": MAX_TOKENS,
        "free":      True,
        "hasApiKey": has_key,
        "enabled":   enabled,
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _format_portfolio(summary: Optional[dict]) -> Optional[str]:
    """Convert portfolio dict to a compact human-readable string for the prompt."""
    if not summary:
        return None
    try:
        pct   = summary.get("gainLossPercent", 0)
        sign  = "+" if pct >= 0 else ""
        count = summary.get("holdingsCount", 0)
        inv   = summary.get("totalInvested", 0)
        cur   = summary.get("currentValue", 0)
        best  = summary.get("bestTickers", "N/A")
        return (
            f"{count} position(s) — investi: {inv:,.0f} MAD, "
            f"valeur actuelle: {cur:,.0f} MAD ({sign}{pct:.2f}%) — "
            f"Meilleures valeurs: {best}"
        )
    except Exception:
        return None
