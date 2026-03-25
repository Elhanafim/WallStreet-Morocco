"""
Input sanitization for the BVC Price microservice.
Applied to all user-controlled inputs before processing.
"""

import re
from typing import Any


# ── Ticker sanitization ────────────────────────────────────────────────────────

_TICKER_PATTERN = re.compile(r"[^A-Za-z0-9:]")

def sanitize_ticker(ticker: str) -> str:
    """Allow only alphanumeric characters and colon (CSEMA:ATW format)."""
    if not isinstance(ticker, str):
        return ""
    clean = _TICKER_PATTERN.sub("", ticker)
    return clean[:30].upper()


def sanitize_tickers(raw: str) -> list[str]:
    """
    Parse a comma-separated list of tickers.
    Returns at most 50 sanitized tickers to prevent abuse.
    """
    if not isinstance(raw, str):
        return []
    parts = raw.split(",")
    result = []
    for part in parts[:50]:
        t = sanitize_ticker(part.strip())
        if t:
            result.append(t)
    return result


# ── General string sanitization ───────────────────────────────────────────────

_NULL_BYTE_RE = re.compile(r"\x00")
_DANGEROUS_CHARS = re.compile(r"[<>\"\'\`]")


def sanitize_string(value: Any, max_length: int = 200) -> str:
    """
    Remove null bytes, limit length, strip surrounding whitespace.
    Does not allow HTML tags — plain text only.
    """
    if not isinstance(value, str):
        return ""
    clean = _NULL_BYTE_RE.sub("", value)
    clean = _DANGEROUS_CHARS.sub("", clean)
    return clean[:max_length].strip()


# ── SQL injection detection ───────────────────────────────────────────────────
# The price service does not use SQL, but this guard protects
# against injection attempts forwarded to external APIs.

_SQLI_PATTERNS = [
    re.compile(r"(union|select|insert|update|delete|drop|create|alter|exec)", re.IGNORECASE),
    re.compile(r"(--|#|\/\*|\*\/|;--)", re.IGNORECASE),
    re.compile(r"xp_cmdshell|exec\s*\(", re.IGNORECASE),
    re.compile(r"(\bor\b|\band\b)\s+[\d\w'\"]+\s*[=<>]", re.IGNORECASE),
]


def looks_like_sqli(value: str) -> bool:
    """Return True if the value resembles a SQL injection attempt."""
    for pattern in _SQLI_PATTERNS:
        if pattern.search(value):
            return True
    return False


# ── Integer/float sanitization ────────────────────────────────────────────────

def sanitize_int(value: Any, default: int = 0, min_val: int = 0, max_val: int = 10_000) -> int:
    try:
        v = int(value)
        return max(min_val, min(v, max_val))
    except (TypeError, ValueError):
        return default


def sanitize_positive_float(value: Any, default: float = 0.0) -> float:
    try:
        v = float(value)
        if v < 0 or v != v:  # negative or NaN
            return default
        return v
    except (TypeError, ValueError):
        return default
