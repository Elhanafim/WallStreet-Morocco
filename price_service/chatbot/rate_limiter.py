"""
Per-IP rate limiter for the WallStreet Morocco chatbot.
In-memory — resets on service restart (acceptable for free tier).
"""

import time
from collections import defaultdict
from typing import Tuple

LIMITS = {
    "per_minute": 15,
    "per_hour":   100,
    "per_day":    500,
    "max_chars":  2000,
    "max_turns":  20,
}

_BLOCKED_PATTERNS = [
    "<script",
    "javascript:",
    "data:text/html",
    "vbscript:",
    "onload=",
    "onerror=",
]

# Structure: { ip: { "minute": [...timestamps], "hour": [...], "day": [...] } }
_store: dict = defaultdict(lambda: {"minute": [], "hour": [], "day": []})


def check_rate_limit(ip: str) -> Tuple[bool, str]:
    """
    Check whether the given IP is within rate limits.
    Returns (allowed: bool, error_message: str).
    Calling this function consumes one credit if allowed.
    """
    now = time.time()
    s = _store[ip]

    # Slide windows
    s["minute"] = [t for t in s["minute"] if now - t < 60]
    s["hour"]   = [t for t in s["hour"]   if now - t < 3_600]
    s["day"]    = [t for t in s["day"]    if now - t < 86_400]

    if len(s["minute"]) >= LIMITS["per_minute"]:
        return False, "Trop de messages. Attendez 1 minute avant de renvoyer un message."
    if len(s["hour"]) >= LIMITS["per_hour"]:
        return False, "Limite horaire atteinte (100 messages/heure). Revenez dans 1h."
    if len(s["day"]) >= LIMITS["per_day"]:
        return False, "Limite journalière atteinte (500 messages/jour). Revenez demain."

    s["minute"].append(now)
    s["hour"].append(now)
    s["day"].append(now)
    return True, ""


def validate_message(content: str) -> Tuple[bool, str]:
    """
    Validate message content for safety.
    Returns (valid: bool, error_message: str).
    """
    if not content or not content.strip():
        return False, "Message vide."

    if len(content) > LIMITS["max_chars"]:
        return False, f"Message trop long (maximum {LIMITS['max_chars']} caractères)."

    lower = content.lower()
    for pattern in _BLOCKED_PATTERNS:
        if pattern in lower:
            return False, "Contenu non autorisé."

    return True, ""


def remaining_credits(ip: str) -> dict:
    """Return remaining message credits for an IP (for debugging)."""
    now = time.time()
    s = _store[ip]
    return {
        "per_minute": max(0, LIMITS["per_minute"] - len([t for t in s["minute"] if now - t < 60])),
        "per_hour":   max(0, LIMITS["per_hour"]   - len([t for t in s["hour"]   if now - t < 3_600])),
        "per_day":    max(0, LIMITS["per_day"]    - len([t for t in s["day"]    if now - t < 86_400])),
    }
