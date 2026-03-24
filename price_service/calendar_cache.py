"""
Calendar-specific cache wrapper.
Reuses PriceCache but stores calendar event lists with a longer TTL.
"""

import asyncio
import logging
import os
from typing import Optional

from price_cache import PriceCache

log = logging.getLogger("calendar-cache")

CALENDAR_TTL = int(os.getenv("CALENDAR_TTL_SECONDS", "900"))   # 15 min default
MOROCCO_TTL = int(os.getenv("MOROCCO_CALENDAR_TTL_SECONDS", "1800"))  # 30 min

_cache = PriceCache(ttl_seconds=CALENDAR_TTL)
_morocco_cache = PriceCache(ttl_seconds=MOROCCO_TTL)

CACHE_KEY_ALL = "CALENDAR:ALL"
CACHE_KEY_MOROCCO = "CALENDAR:MOROCCO"


def get_all() -> Optional[list[dict]]:
    hit = _cache.get(CACHE_KEY_ALL)
    return hit.get("events") if hit else None


def set_all(events: list[dict]) -> None:
    _cache.set(CACHE_KEY_ALL, {"events": events})
    log.info("Calendar cache updated: %d events", len(events))


def get_morocco() -> Optional[list[dict]]:
    hit = _morocco_cache.get(CACHE_KEY_MOROCCO)
    return hit.get("events") if hit else None


def set_morocco(events: list[dict]) -> None:
    _morocco_cache.set(CACHE_KEY_MOROCCO, {"events": events})
    log.info("Morocco calendar cache updated: %d events", len(events))


def is_fresh_all() -> bool:
    return _cache.is_fresh(CACHE_KEY_ALL)


def is_fresh_morocco() -> bool:
    return _morocco_cache.is_fresh(CACHE_KEY_MOROCCO)


async def refresh(days_back: int = 3, days_forward: int = 14) -> list[dict]:
    """Fetch fresh data, populate both caches, return all events."""
    from calendar_fetcher import fetch_all_events

    events = await fetch_all_events(days_back=days_back, days_forward=days_forward)
    set_all(events)

    morocco_events = [e for e in events if e.get("isMoroccoRelevant")]
    set_morocco(morocco_events)
    return events


async def get_or_refresh(morocco_only: bool = False) -> list[dict]:
    """Return cached events or trigger a refresh if stale."""
    if morocco_only:
        cached = get_morocco()
        if cached is not None:
            return cached
    else:
        cached = get_all()
        if cached is not None:
            return cached

    # Cache miss — refresh
    all_events = await refresh()
    if morocco_only:
        return [e for e in all_events if e.get("isMoroccoRelevant")]
    return all_events
