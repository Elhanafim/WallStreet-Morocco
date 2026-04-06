"""
Simple in-memory cache for OPCVM data.
OPCVM VL values are updated at most once per business day,
so a 6-hour TTL is appropriate.
"""

import asyncio
from datetime import datetime, timedelta

_cache: dict = {"data": None, "expires": None}
_lock = asyncio.Lock()

CACHE_TTL_HOURS = 6


async def get_cached_opcvm(scraper_fn) -> dict:
    async with _lock:
        now = datetime.now()
        if (
            _cache["data"] is not None
            and _cache["expires"] is not None
            and now < _cache["expires"]
            and _cache["data"].get("total", 0) > 0
        ):
            return {**_cache["data"], "cached": True}

        data = await scraper_fn()
        if data.get("total", 0) > 0:
            _cache["data"] = data
            _cache["expires"] = now + timedelta(hours=CACHE_TTL_HOURS)

        return {**data, "cached": False}


def invalidate_cache() -> None:
    """Force cache refresh on next request."""
    _cache["data"] = None
    _cache["expires"] = None
