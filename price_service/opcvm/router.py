"""
OPCVM FastAPI router.

Endpoints:
  GET /opcvm/          — all funds, with optional type/sg/sort filters
  GET /opcvm/top       — top N funds by a given metric
  GET /opcvm/summary   — aggregated stats by fund type
  POST /opcvm/refresh  — manually invalidate cache
"""

from fastapi import APIRouter, Query
from .scraper import get_opcvm_data
from .cache import get_cached_opcvm, invalidate_cache

router = APIRouter(prefix="/opcvm", tags=["opcvm"])


@router.get("/")
async def get_all_opcvm(
    type: str | None = Query(None, description="Filter by type: Actions, Obligataire, Monetaire, Diversifie"),
    sg: str | None = Query(None, description="Filter by Société de Gestion (partial match)"),
    sort: str = Query("perf_ytd", description="Sort field: vl, perf_1m, perf_ytd, perf_1an, encours"),
    order: str = Query("desc", description="asc or desc"),
):
    data = await get_cached_opcvm(get_opcvm_data)
    funds = list(data["funds"])

    if type:
        funds = [f for f in funds if type.lower() in (f.get("type") or "").lower()]
    if sg:
        funds = [f for f in funds if sg.lower() in (f.get("societe_gestion") or "").lower()]

    reverse = order.lower() != "asc"
    funds = sorted(funds, key=lambda f: f.get(sort) if f.get(sort) is not None else -999, reverse=reverse)

    return {
        **{k: v for k, v in data.items() if k != "funds"},
        "funds": funds,
        "returned": len(funds),
    }


@router.get("/top")
async def get_top_opcvm(
    n: int = Query(5, ge=1, le=50, description="Number of top funds to return"),
    metric: str = Query("perf_ytd", description="Metric to rank by"),
):
    data = await get_cached_opcvm(get_opcvm_data)
    eligible = [f for f in data["funds"] if f.get(metric) is not None]
    top = sorted(eligible, key=lambda f: f[metric], reverse=True)[:n]
    return {
        "top": top,
        "metric": metric,
        "source": data["source"],
        "last_updated": data["last_updated"],
    }


@router.get("/summary")
async def get_opcvm_summary():
    data = await get_cached_opcvm(get_opcvm_data)
    funds = data["funds"]

    by_type: dict = {}
    for f in funds:
        t = (f.get("type") or "Autre").strip()
        if t not in by_type:
            by_type[t] = {"count": 0, "ytd_values": [], "total_encours": 0.0}
        by_type[t]["count"] += 1
        if f.get("perf_ytd") is not None:
            by_type[t]["ytd_values"].append(f["perf_ytd"])
        if f.get("encours"):
            by_type[t]["total_encours"] += f["encours"]

    summary = {}
    for t, stats in by_type.items():
        vals = stats["ytd_values"]
        summary[t] = {
            "count": stats["count"],
            "avg_ytd": round(sum(vals) / len(vals), 2) if vals else None,
            "total_encours": round(stats["total_encours"], 2),
        }

    return {
        "summary": summary,
        "total_funds": len(funds),
        "source": data["source"],
        "last_updated": data["last_updated"],
        "cached": data.get("cached", False),
    }


@router.post("/refresh")
async def refresh_opcvm_cache():
    """Manually invalidate the OPCVM cache and trigger a fresh scrape."""
    invalidate_cache()
    data = await get_cached_opcvm(get_opcvm_data)
    return {"message": "Cache refreshed", "count": data["count"], "source": data["source"]}
