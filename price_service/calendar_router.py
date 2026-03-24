"""
FastAPI router for /calendar endpoints.
Mounted into main.py via app.include_router(calendar_router).
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

import calendar_cache

log = logging.getLogger("calendar-router")

calendar_router = APIRouter(prefix="/calendar", tags=["calendar"])


# ── Background refresh task ───────────────────────────────────────────────────

async def _bg_refresh():
    """Periodic background refresh for calendar data."""
    while True:
        try:
            await calendar_cache.refresh()
            await asyncio.sleep(calendar_cache.CALENDAR_TTL)
        except asyncio.CancelledError:
            break
        except Exception as exc:
            log.error("Calendar background refresh error: %s", exc)
            await asyncio.sleep(60)


def start_background_refresh() -> asyncio.Task:
    return asyncio.create_task(_bg_refresh())


# ── Endpoints ─────────────────────────────────────────────────────────────────

@calendar_router.get("/events")
async def get_events(
    morocco_only: bool = Query(False, description="Filter to Morocco-relevant events only"),
    impact_min: int = Query(1, ge=1, le=5, description="Minimum impact score (1–5)"),
    category: Optional[str] = Query(None, description="Filter by category slug"),
    country: Optional[str] = Query(None, description="Filter by ISO country code"),
    upcoming_only: bool = Query(False, description="Return only future events"),
    past_only: bool = Query(False, description="Return only past events"),
    limit: int = Query(100, ge=1, le=500),
):
    events = await calendar_cache.get_or_refresh(morocco_only=morocco_only)

    # Apply filters
    if impact_min > 1:
        events = [e for e in events if e.get("impactScore", 1) >= impact_min]
    if category:
        events = [e for e in events if e.get("category") == category.lower()]
    if country:
        events = [e for e in events if e.get("country") == country.upper()]
    if upcoming_only:
        events = [e for e in events if e.get("isUpcoming")]
    if past_only:
        events = [e for e in events if e.get("isPast")]

    now = datetime.now(timezone.utc).isoformat()
    return {
        "events": events[:limit],
        "total": len(events),
        "returned": min(len(events), limit),
        "cachedAt": now,
        "moroccoOnly": morocco_only,
    }


@calendar_router.get("/events/morocco")
async def get_morocco_events(
    impact_min: int = Query(1, ge=1, le=5),
    upcoming_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
):
    """Convenience endpoint: only Morocco-relevant events, sorted by date."""
    events = await calendar_cache.get_or_refresh(morocco_only=True)

    if impact_min > 1:
        events = [e for e in events if e.get("impactScore", 1) >= impact_min]
    if upcoming_only:
        events = [e for e in events if e.get("isUpcoming")]

    now = datetime.now(timezone.utc).isoformat()
    return {
        "events": events[:limit],
        "total": len(events),
        "returned": min(len(events), limit),
        "cachedAt": now,
    }


@calendar_router.get("/events/{event_id}")
async def get_event(event_id: str):
    """Get a single event by its ID."""
    events = await calendar_cache.get_or_refresh()
    for ev in events:
        if ev.get("id") == event_id:
            return ev
    raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")


@calendar_router.post("/refresh")
async def force_refresh(background_tasks: BackgroundTasks):
    """Manually trigger a calendar data refresh (runs in background)."""
    background_tasks.add_task(calendar_cache.refresh)
    return {"status": "refresh_queued", "timestamp": datetime.now(timezone.utc).isoformat()}


@calendar_router.get("/stats")
async def get_stats():
    """Return summary statistics about cached calendar events."""
    events = await calendar_cache.get_or_refresh()

    by_country: dict[str, int] = {}
    by_category: dict[str, int] = {}
    by_impact: dict[str, int] = {}
    morocco_count = 0
    upcoming_count = 0

    for ev in events:
        c = ev.get("country", "XX")
        by_country[c] = by_country.get(c, 0) + 1

        cat = ev.get("category", "macro")
        by_category[cat] = by_category.get(cat, 0) + 1

        score = str(ev.get("impactScore", 1))
        by_impact[score] = by_impact.get(score, 0) + 1

        if ev.get("isMoroccoRelevant"):
            morocco_count += 1
        if ev.get("isUpcoming"):
            upcoming_count += 1

    return {
        "total": len(events),
        "moroccoRelevant": morocco_count,
        "upcoming": upcoming_count,
        "byCountry": by_country,
        "byCategory": by_category,
        "byImpact": by_impact,
        "cacheStatus": {
            "allFresh": calendar_cache.is_fresh_all(),
            "moroccoFresh": calendar_cache.is_fresh_morocco(),
        },
    }
