"""
OPCVM FastAPI router.

Endpoints:
  GET /opcvm/          — all funds, with optional type/sg/sort/order/limit filters
  GET /opcvm/top       — top N and worst N funds by a given metric
  GET /opcvm/summary   — aggregated stats by fund type
  GET /opcvm/health    — data freshness health check
  POST /opcvm/refresh  — manually invalidate cache and re-fetch
"""

from fastapi import APIRouter, Query
from .scraper import get_opcvm_data
from .cache import get_cached_opcvm, invalidate_cache

router = APIRouter(prefix="/opcvm", tags=["opcvm"])


@router.get("/")
async def get_all_opcvm(
    type:  str | None = Query(None, description="Filter by type: Actions, Obligataires, Monétaires, Diversifiés, Contractuels"),
    sg:    str | None = Query(None, description="Filter by Société de Gestion (partial match)"),
    sort:  str        = Query("perf_ytd", description="Sort field: vl, var_jour, perf_1m, perf_ytd, perf_1an, encours"),
    order: str        = Query("desc", description="asc or desc"),
    limit: int | None = Query(None, description="Max number of results"),
):
    data  = await get_cached_opcvm(get_opcvm_data)
    funds = list(data["funds"])

    if type:
        funds = [f for f in funds if type.lower() in (f.get("type") or "").lower()]
    if sg:
        funds = [f for f in funds if sg.lower() in (f.get("societe_gestion") or "").lower()]

    reverse = order.lower() != "asc"
    funds.sort(
        key=lambda f: (f.get(sort) is not None, f.get(sort) or 0),
        reverse=reverse,
    )
    if limit:
        funds = funds[:limit]

    return {
        **{k: v for k, v in data.items() if k != "funds"},
        "funds":    funds,
        "returned": len(funds),
    }


@router.get("/top")
async def get_top_opcvm(
    n:      int      = Query(5, ge=1, le=50, description="Number of top/worst funds to return"),
    metric: str      = Query("perf_ytd", description="Metric to rank by"),
    type:   str | None = Query(None, description="Filter by type"),
):
    data = await get_cached_opcvm(get_opcvm_data)
    funds = data["funds"]
    if type:
        funds = [f for f in funds if type.lower() in (f.get("type") or "").lower()]
    eligible = [f for f in funds if f.get(metric) is not None]
    ranked   = sorted(eligible, key=lambda f: f[metric], reverse=True)
    return {
        "top":        ranked[:n],
        "worst":      ranked[-n:],
        "metric":     metric,
        "source":     data.get("source"),
        "data_date":  data.get("data_date"),
        "last_updated": data.get("last_updated"),
    }


@router.get("/summary")
async def get_opcvm_summary():
    data  = await get_cached_opcvm(get_opcvm_data)
    funds = data["funds"]

    by_type: dict = {}
    for f in funds:
        t = (f.get("type") or "Autre").strip()
        if t not in by_type:
            by_type[t] = {"count": 0, "ytd_vals": [], "total_encours": 0.0, "best_fund": None}
        by_type[t]["count"] += 1
        if f.get("perf_ytd") is not None:
            by_type[t]["ytd_vals"].append((f["perf_ytd"], f))
        if f.get("encours"):
            by_type[t]["total_encours"] += f["encours"]

    summary = {}
    for t, stats in by_type.items():
        vals = [v for v, _ in stats["ytd_vals"]]
        best = max(stats["ytd_vals"], key=lambda x: x[0])[1] if stats["ytd_vals"] else None
        summary[t] = {
            "count":         stats["count"],
            "avg_ytd":       round(sum(vals) / len(vals), 2) if vals else None,
            "best_ytd":      max(vals) if vals else None,
            "worst_ytd":     min(vals) if vals else None,
            "best_fund":     best["name"] if best else None,
            "total_encours": round(stats["total_encours"], 2),
        }

    total_encours = sum(f.get("encours") or 0 for f in funds)
    return {
        "summary":       summary,
        "total_funds":   len(funds),
        "total_encours": round(total_encours, 2),
        "source":        data.get("source"),
        "data_date":     data.get("data_date"),
        "last_updated":  data.get("last_updated"),
        "cached":        data.get("cached", False),
    }


@router.get("/health")
async def opcvm_health():
    data = await get_cached_opcvm(get_opcvm_data)
    return {
        "status":      "ok" if data.get("total", 0) > 0 else "degraded",
        "total_funds": data.get("total", 0),
        "source":      data.get("source"),
        "data_date":   data.get("data_date"),
        "cached":      data.get("cached", False),
        "error":       data.get("error", False),
    }


@router.post("/refresh")
async def refresh_opcvm_cache():
    """Manually invalidate the OPCVM cache and trigger a fresh scrape."""
    invalidate_cache()
    data = await get_cached_opcvm(get_opcvm_data)
    return {
        "refreshed": True,
        "total":     data.get("total", 0),
        "source":    data.get("source"),
        "data_date": data.get("data_date"),
    }
