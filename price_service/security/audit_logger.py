"""
Security audit logger for the BVC Price microservice.
All security-relevant events are written in structured JSON
so they can be ingested by any log aggregation system.
"""

import json
import logging
import os
from datetime import datetime, timezone
from typing import Optional

# ── Logger setup ──────────────────────────────────────────────────────────────

_security_logger = logging.getLogger("wsm.security")

if not _security_logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(message)s"))
    _security_logger.addHandler(_handler)
    _security_logger.setLevel(logging.INFO)
    _security_logger.propagate = False


# ── Event types ───────────────────────────────────────────────────────────────

class SecurityEvent:
    RATE_LIMIT_EXCEEDED    = "RATE_LIMIT_EXCEEDED"
    SUSPICIOUS_INPUT       = "SUSPICIOUS_INPUT"
    INVALID_TICKER         = "INVALID_TICKER"
    REQUEST_TOO_LARGE      = "REQUEST_TOO_LARGE"
    CORS_VIOLATION         = "CORS_VIOLATION"
    HEALTH_CHECK           = "HEALTH_CHECK"
    PRICE_FETCH_ERROR      = "PRICE_FETCH_ERROR"
    BATCH_TOO_LARGE        = "BATCH_TOO_LARGE"


# ── Log helper ────────────────────────────────────────────────────────────────

def log_security_event(
    event_type: str,
    ip: str,
    user_id: Optional[str] = None,
    details: Optional[dict] = None,
    severity: str = "INFO",
) -> None:
    """
    Emit a structured JSON security log entry.

    Args:
        event_type: One of the SecurityEvent constants.
        ip:         Client IP address (already extracted/validated by caller).
        user_id:    Optional authenticated user identifier.
        details:    Arbitrary dict with extra context (avoid PII).
        severity:   INFO | WARNING | ERROR | CRITICAL
    """
    entry = {
        "ts":      datetime.now(timezone.utc).isoformat(),
        "event":   event_type,
        "ip":      _anonymize_ip(ip),
        "userId":  user_id,
        "sev":     severity,
        "details": details or {},
        "svc":     "bvc-price",
    }

    line = json.dumps(entry, ensure_ascii=False)

    if severity in ("WARNING", "ERROR", "CRITICAL"):
        _security_logger.warning(line)
    else:
        _security_logger.info(line)


def _anonymize_ip(ip: str) -> str:
    """
    Partially anonymize the IP for GDPR compliance.
    IPv4: zero the last octet (192.168.1.42 → 192.168.1.0)
    IPv6: keep only the first 4 groups.
    """
    if not ip:
        return "0.0.0.0"
    if ":" in ip:
        # IPv6
        parts = ip.split(":")
        return ":".join(parts[:4] + ["0", "0", "0", "0"])
    # IPv4
    parts = ip.split(".")
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.{parts[2]}.0"
    return ip
