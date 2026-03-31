"""
Simple in-memory cache for OPCVM data.
OPCVM VL values are updated at most once per business day,
so a 6-hour TTL is appropriate.
"""

from datetime import datetime, timedelta

_cache: dict = {"data": None, "expires": None}

CACHE_TTL_HOURS = 6


async def get_cached_opcvm(scraper_fn) -> dict:
    now = datetime.now()
    if _cache["data"] is not None and _cache["expires"] and now < _cache["expires"]:
        return {**_cache["data"], "cached": True}

    data = await scraper_fn()
    _cache["data"] = data
    _cache["expires"] = now + timedelta(hours=CACHE_TTL_HOURS)
    return {**data, "cached": False}


def invalidate_cache() -> None:
    """Force cache refresh on next request."""
    _cache["data"] = None
    _cache["expires"] = None
