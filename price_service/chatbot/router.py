"""
FastAPI chatbot router — Groq / Llama 3.1 70B streaming endpoint.
Streams Server-Sent Events (SSE) to the frontend.
"""

import asyncio
import json
import logging
import os
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel

from .rate_limiter import check_rate_limit, validate_message
from .system_prompt import build_system_prompt

logger = logging.getLogger("wsm.chatbot")

router = APIRouter(prefix="/chat", tags=["chatbot"])

# ── Model config ───────────────────────────────────────────────────────────────
# Free Groq models (best → fastest):
#   llama-3.1-70b-versatile   — best quality, 131k context
#   llama-3.1-8b-instant      — fastest response
#   mixtral-8x7b-32768        — long context tasks
GROQ_MODEL  = os.getenv("CHAT_MODEL", "llama-3.1-70b-versatile")
MAX_TOKENS  = int(os.getenv("CHAT_MAX_TOKENS", "1024"))
TEMPERATURE = 0.7

_client: Optional[Groq] = None


def get_groq_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY not set. "
                "Get your free key at https://console.groq.com"
            )
        _client = Groq(api_key=api_key)
    return _client


# ── Schemas ───────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role:    str   # "user" or "assistant"
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
    Powered by Groq API + Llama 3.1 70B — completely free.

    SSE event types emitted:
      { "type": "token",  "content": "..." }   — incremental token
      { "type": "done" }                        — stream finished
      { "type": "error", "content": "..." }     — error message
    """
    # Disable chat if explicitly turned off
    if os.getenv("CHAT_ENABLED", "true").lower() == "false":
        raise HTTPException(status_code=503, detail="Chat service is disabled.")

    ip = getattr(request.client, "host", "0.0.0.0")

    # Per-IP rate limiting
    allowed, err = check_rate_limit(ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=err)

    # Input validation
    if not body.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    last_msg = body.messages[-1]
    valid, err = validate_message(last_msg.content)
    if not valid:
        raise HTTPException(status_code=400, detail=err)

    # Build dynamic system prompt with full per-request context
    system = build_system_prompt(
        language=body.language,
        current_page=body.currentPage,
        is_authenticated=body.isAuthenticated,
        portfolio_summary=body.portfolioSummary,
        market_status=body.marketStatus,
    )

    # Keep last MAX_TURNS messages, filter to valid roles
    messages_for_groq = [
        {"role": m.role, "content": m.content}
        for m in body.messages[-20:]
        if m.role in ("user", "assistant") and m.content.strip()
    ]

    async def generate():
        try:
            client = get_groq_client()

            # Groq streaming — identical interface to OpenAI
            stream = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    *messages_for_groq,
                ],
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE,
                stream=True,
            )

            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    payload = json.dumps({"type": "token", "content": delta.content}, ensure_ascii=False)
                    yield f"data: {payload}\n\n"
                    await asyncio.sleep(0)  # yield control to event loop

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
    """Check chatbot service availability."""
    has_key   = bool(os.getenv("GROQ_API_KEY"))
    enabled   = os.getenv("CHAT_ENABLED", "true").lower() != "false"
    return {
        "status":    "ok" if (has_key and enabled) else "degraded",
        "provider":  "Groq",
        "model":     GROQ_MODEL,
        "free":      True,
        "hasApiKey": has_key,
        "enabled":   enabled,
    }
