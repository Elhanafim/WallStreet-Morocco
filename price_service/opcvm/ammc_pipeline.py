"""
AMMC OPCVM Weekly Data Pipeline
================================
Downloads the latest weekly XLS from data.gov.ma (AMMC), parses aggregate
category statistics, computes financial metrics and AI-style insights, then
writes the results to public/data/opcvm/{history,latest}.json.

Run manually:
    python -m price_service.opcvm.ammc_pipeline

Or via GitHub Actions (see .github/workflows/opcvm-ammc-update.yml).
"""

from __future__ import annotations

import io
import json
import logging
import os
import re
import sys
from datetime import datetime, date
from pathlib import Path
from typing import Optional

import httpx
import pandas as pd

log = logging.getLogger("ammc-pipeline")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

# ── Paths ─────────────────────────────────────────────────────────────────────

REPO_ROOT    = Path(__file__).resolve().parents[2]   # …/wallstreet-morocco/
DATA_DIR     = REPO_ROOT / "public" / "data" / "opcvm"
HISTORY_FILE = DATA_DIR / "history.json"
LATEST_FILE  = DATA_DIR / "latest.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)

# ── HTTP headers (browser-like to avoid 403) ──────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
}

DATASET_URLS = [
    "https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2026",
    "https://data.gov.ma/data/fr/dataset/05bc218e-19f3-424a-94c6-dd1a79d2f189",
    "https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2025",
]

# ── Category keyword → canonical key ─────────────────────────────────────────

CATEGORY_PATTERNS: list[tuple[str, str, str]] = [
    # (regex pattern, canonical_key, label)
    (r"action",              "actions",         "Actions"),
    (r"oblig.*(mlt|ml|long|moyen)", "obligataire_mlt", "Oblig. MLT"),
    (r"oblig.*(ct|court)",   "obligataire_ct",  "Oblig. CT"),
    (r"oblig(?!.*ct|.*court|.*mlt|.*ml|.*long|.*moyen)", "obligataire_mlt", "Obligataires"),
    (r"mon.taire",           "monetaire",       "Monétaires"),
    (r"diversif",            "diversifie",      "Diversifiés"),
    (r"contract",            "contractuel",     "Contractuels"),
]

CATEGORY_ORDER = [
    "monetaire", "obligataire_mlt", "obligataire_ct",
    "actions", "diversifie", "contractuel",
]

# ── XLS discovery & download ──────────────────────────────────────────────────

async def _find_latest_xls_url(client: httpx.AsyncClient) -> Optional[str]:
    """Scrape data.gov.ma to find the most recent OPCVM XLS link."""
    for dataset_url in DATASET_URLS:
        try:
            resp = await client.get(dataset_url, timeout=15)
            if resp.status_code != 200:
                continue
            links = re.findall(
                r'href="([^"]+\.xlsx?)"',
                resp.text,
                re.IGNORECASE,
            )
            if links:
                xls_url = links[-1]
                if not xls_url.startswith("http"):
                    xls_url = "https://data.gov.ma" + xls_url
                log.info("XLS found: %s", xls_url)
                return xls_url
        except Exception as exc:
            log.warning("Could not fetch %s: %s", dataset_url, exc)
    return None


async def download_latest_xls() -> tuple[Optional[bytes], Optional[str]]:
    """Return (xls_bytes, filename) of the latest AMMC weekly file."""
    async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True) as client:
        url = await _find_latest_xls_url(client)
        if not url:
            log.error("No XLS URL found on data.gov.ma")
            return None, None
        resp = await client.get(url, timeout=60)
        resp.raise_for_status()
        filename = url.rstrip("/").split("/")[-1]
        log.info("Downloaded %s (%d bytes)", filename, len(resp.content))
        return resp.content, filename


# ── Date extraction from filename or content ──────────────────────────────────

def _extract_date_from_filename(filename: str) -> Optional[str]:
    """
    Try to extract ISO date from filename such as:
        stat_opcvm_hebdo_ammc_27-03-2026.xlsx
    """
    m = re.search(r"(\d{2})-(\d{2})-(\d{4})", filename)
    if m:
        return f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", filename)
    if m:
        return m.group(0)
    return None


def _extract_date_from_df(df: pd.DataFrame) -> Optional[str]:
    """Scan first 10 rows for a date pattern."""
    for _, row in df.head(10).iterrows():
        for val in row.values:
            if val is None:
                continue
            s = str(val)
            m = re.search(r"(\d{2})[/-](\d{2})[/-](\d{4})", s)
            if m:
                return f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    return None


# ── XLS parsing ───────────────────────────────────────────────────────────────

def _match_category(text: str) -> Optional[tuple[str, str]]:
    """Return (canonical_key, label) if text matches a known category."""
    t = text.lower().strip()
    t = t.replace("é", "e").replace("è", "e").replace("â", "a").replace("ô", "o")
    for pattern, key, label in CATEGORY_PATTERNS:
        if re.search(pattern, t):
            return key, label
    return None


def _is_numeric(val) -> bool:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return False
    try:
        float(str(val).replace(",", ".").replace(" ", "").replace("\xa0", ""))
        return True
    except (ValueError, TypeError):
        return False


def _to_float(val) -> Optional[float]:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    s = str(val).replace(",", ".").replace(" ", "").replace("\xa0", "").replace("%", "")
    try:
        return float(s)
    except (ValueError, TypeError):
        return None


def parse_ammc_xls(content: bytes, filename: str = "") -> Optional[dict]:
    """
    Parse an AMMC weekly XLS file and return a structured dict.

    The AMMC files have varying layouts; we try multiple skiprows values
    and fall back to a generic row-scanning strategy.

    Returns None if parsing fails.
    """
    buf = io.BytesIO(content)
    df: Optional[pd.DataFrame] = None

    # Try multiple skiprows to find the data table
    for skiprows in range(8):
        try:
            buf.seek(0)
            candidate = pd.read_excel(buf, sheet_name=0, skiprows=skiprows, header=0, dtype=str)
            # A valid data table has at least one recognized category in the first column
            col0 = candidate.iloc[:, 0].fillna("").astype(str)
            if any(_match_category(v) is not None for v in col0):
                df = candidate
                log.info("XLS parsed with skiprows=%d", skiprows)
                break
        except Exception:
            continue

    if df is None:
        log.warning("Could not auto-detect skiprows; using skiprows=3 as fallback")
        buf.seek(0)
        try:
            df = pd.read_excel(buf, sheet_name=0, skiprows=3, header=0, dtype=str)
        except Exception as exc:
            log.error("XLS parse failed: %s", exc)
            return None

    # Extract date
    data_date = _extract_date_from_filename(filename) or _extract_date_from_df(df)
    if not data_date:
        data_date = date.today().isoformat()
    log.info("Data date: %s", data_date)

    # Scan rows for category data
    categories: dict[str, dict] = {}

    for _, row in df.iterrows():
        values = list(row.values)
        if not values:
            continue
        first = str(values[0]).strip()

        # Skip header/total/empty rows
        if not first or first.lower() in ("nan", "total", "total général", "catégorie", "catégories"):
            continue
        if "total" in first.lower() and len(first) < 20:
            continue

        match = _match_category(first)
        if match is None:
            continue
        key, label = match

        # Extract numeric values from the row (cols 1..N)
        nums = [_to_float(v) for v in values[1:] if _is_numeric(v)]
        if len(nums) < 2:
            continue

        # Column mapping (AMMC format):
        # [nb_fonds?, actif_net, variation_hebdo?, souscriptions, rachats, flux_nets, ...]
        # We detect by scale: actif_net is very large (>1000), flows are moderate
        large = [n for n in nums if n is not None and abs(n) > 1000]
        moderate = [n for n in nums if n is not None and abs(n) <= 1000]

        aum          = large[0]  if large    else nums[0]
        subscriptions = moderate[0] if len(moderate) >= 1 else None
        redemptions   = moderate[1] if len(moderate) >= 2 else None
        net_flow      = moderate[2] if len(moderate) >= 3 else (
            subscriptions - redemptions if subscriptions and redemptions else None
        )
        perf_index    = None   # not always present

        # Look for performance index column (value near 100)
        for n in nums:
            if n is not None and 98 <= n <= 130:
                perf_index = n
                break

        # Number of funds (small integer <1000)
        nb_fonds = None
        for n in nums:
            if n is not None and n == int(n) and 1 <= n < 500:
                nb_fonds = int(n)
                break

        categories[key] = {
            "label":         label,
            "aum":           round(aum, 2) if aum else None,
            "subscriptions": round(subscriptions, 2) if subscriptions else None,
            "redemptions":   round(redemptions, 2)   if redemptions   else None,
            "net_flow":      round(net_flow, 2)       if net_flow      else None,
            "perf_index":    round(perf_index, 4)     if perf_index    else None,
            "nb_fonds":      nb_fonds,
        }

    if not categories:
        log.error("No categories found in XLS — file may have changed format")
        return None

    log.info("Parsed categories: %s", list(categories.keys()))

    return {
        "raw_date":   data_date,
        "categories": categories,
        "filename":   filename,
    }


# ── Metric computation ────────────────────────────────────────────────────────

def compute_metrics(raw: dict, history: list[dict]) -> dict:
    """
    Enrich raw parsed data with growth rates, weights, scores, insights.
    """
    cats: dict[str, dict] = raw["categories"]
    data_date = raw["raw_date"]

    aum_total = sum(c.get("aum") or 0 for c in cats.values())
    flows_total = {
        "subscriptions": sum(c.get("subscriptions") or 0 for c in cats.values()),
        "redemptions":   sum(c.get("redemptions")   or 0 for c in cats.values()),
        "net_flow":      sum(c.get("net_flow")       or 0 for c in cats.values()),
    }

    # Previous week snapshot for growth calculation
    prev = history[-1] if history else None
    prev_cats = prev["categories"] if prev else {}
    aum_prev  = prev["aum_total"]  if prev else None
    weekly_growth = (
        (aum_total - aum_prev) / aum_prev
        if aum_prev and aum_prev > 0 else None
    )

    # Week number
    try:
        dt = datetime.strptime(data_date, "%Y-%m-%d").date()
        week_number = dt.isocalendar()[1]
    except ValueError:
        week_number = None

    # Enrich each category
    enriched: dict[str, dict] = {}
    for key in CATEGORY_ORDER:
        c = cats.get(key)
        if not c:
            continue
        aum = c.get("aum") or 0
        pc  = prev_cats.get(key, {})
        aum_p = pc.get("aum") if pc else None
        cat_growth = (aum - aum_p) / aum_p if aum_p and aum_p > 0 else None
        weight = (aum / aum_total * 100) if aum_total > 0 else 0
        net_flow = c.get("net_flow") or 0
        net_flow_pct = (net_flow / aum * 100) if aum > 0 else None
        score = _compute_score(
            perf_index=c.get("perf_index"),
            net_flow_pct=net_flow_pct,
            weekly_growth=cat_growth,
        )

        enriched[key] = {
            "label":         c.get("label", key),
            "aum":           round(aum, 2),
            "aum_prev":      round(aum_p, 2) if aum_p else None,
            "weight":        round(weight, 2),
            "weekly_growth": round(cat_growth, 5) if cat_growth is not None else None,
            "perf_index":    c.get("perf_index"),
            "subscriptions": c.get("subscriptions"),
            "redemptions":   c.get("redemptions"),
            "net_flow":      round(net_flow, 2),
            "net_flow_pct":  round(net_flow_pct, 3) if net_flow_pct is not None else None,
            "nb_fonds":      c.get("nb_fonds"),
            "score":         score,
        }

    scores = {k: v["score"] for k, v in enriched.items()}
    insights = generate_insights(enriched, history, aum_total, flows_total, weekly_growth)

    return {
        "date":          data_date,
        "week_number":   week_number,
        "aum_total":     round(aum_total, 2),
        "aum_prev":      round(aum_prev, 2) if aum_prev else None,
        "weekly_growth": round(weekly_growth, 5) if weekly_growth is not None else None,
        "categories":    enriched,
        "flows":         {k: round(v, 2) for k, v in flows_total.items()},
        "insights":      insights,
        "scores":        scores,
        "source":        "AMMC via data.gov.ma",
    }


def _compute_score(
    perf_index:    Optional[float],
    net_flow_pct:  Optional[float],
    weekly_growth: Optional[float],
) -> float:
    """
    OPCVM Score = 40% performance + 35% inflow strength + 25% stability
    Normalized to 0–100.
    """
    # Performance component: index above 100 → good
    # 25% gain (index = 125) maps to 100 pts; index = 100 maps to 40 pts
    if perf_index is not None:
        perf_score = min(100, max(0, 40 + (perf_index - 100) * 2.4))
    else:
        perf_score = 50.0

    # Inflow component: net_flow as % of AUM
    # +1% weekly inflow → 100; 0% → 50; -1% → 0
    if net_flow_pct is not None:
        flow_score = min(100, max(0, 50 + net_flow_pct * 50))
    else:
        flow_score = 50.0

    # Stability: based on weekly growth magnitude (less volatile = more stable)
    if weekly_growth is not None:
        stability_score = min(100, max(0, 100 - abs(weekly_growth) * 1000))
    else:
        stability_score = 60.0

    total = 0.40 * perf_score + 0.35 * flow_score + 0.25 * stability_score
    return round(min(100, max(0, total)), 1)


# ── Insight generation ────────────────────────────────────────────────────────

def generate_insights(
    cats: dict[str, dict],
    history: list[dict],
    aum_total: float,
    flows: dict,
    weekly_growth: Optional[float],
) -> list[str]:
    insights: list[str] = []

    # Net flow commentary
    net = flows.get("net_flow", 0)
    if net > 1000:
        insights.append(
            f"Forte accélération des flux nets : +{net:,.0f} M MAD — signal haussier marqué."
        )
    elif net > 400:
        insights.append(
            f"Flux nets positifs à +{net:,.0f} M MAD — dynamisme des souscriptions maintenu."
        )
    elif net < 0:
        insights.append(
            f"Flux nets négatifs ({net:,.0f} M MAD) — pression baissière sur les rachats."
        )

    # Dominant category
    if cats:
        dominant = max(cats.values(), key=lambda c: c.get("weight", 0))
        insights.append(
            f"Les fonds {dominant['label']} dominent avec "
            f"{dominant['weight']:.1f} % de l'actif total géré."
        )

    # Best performing category
    perf_cats = {k: v for k, v in cats.items() if v.get("perf_index") is not None}
    if perf_cats:
        best_perf = max(perf_cats.items(), key=lambda x: x[1]["perf_index"])
        key, cat = best_perf
        insights.append(
            f"Les fonds {cat['label']} affichent la meilleure performance "
            f"(indice {cat['perf_index']:.2f})."
        )

    # Outflow detection
    outflow_cats = [v["label"] for v in cats.values() if (v.get("net_flow") or 0) < 0]
    if outflow_cats:
        labels = ", ".join(outflow_cats)
        insights.append(
            f"Sorties nettes détectées sur : {labels} — surveiller la tendance."
        )

    # Rotation detection (equity gaining, bonds losing or vice-versa)
    eq  = cats.get("actions",         {})
    obl = cats.get("obligataire_mlt", {})
    eq_flow  = eq.get("net_flow",  0) or 0
    obl_flow = obl.get("net_flow", 0) or 0
    if eq_flow > 50 and obl_flow < 0:
        insights.append(
            "Rotation détectée : flux entrants sur les Actions, sortants sur les Obligataires."
        )
    elif obl_flow > 100 and eq_flow < 0:
        insights.append(
            "Rotation vers les Obligataires : probable aversion au risque des investisseurs."
        )

    # AUM record
    if history:
        past_aums = [h["aum_total"] for h in history]
        if aum_total > max(past_aums):
            insights.append(
                f"Nouvel encours record : {aum_total:,.0f} M MAD — "
                f"plus haut niveau historique depuis le début du suivi."
            )

    # Weekly growth
    if weekly_growth is not None:
        pct = weekly_growth * 100
        if pct > 0.5:
            insights.append(
                f"Encours hebdomadaire en hausse de +{pct:.2f} % — momentum positif confirmé."
            )
        elif pct < -0.3:
            insights.append(
                f"Repli hebdomadaire de {pct:.2f} % de l'encours global — consolidation en cours."
            )

    # 3-week momentum on best category
    if history and len(history) >= 2 and cats:
        best_key = max(cats, key=lambda k: cats[k].get("score", 0))
        recent_growths = []
        for snap in history[-2:]:
            prev_c = snap["categories"].get(best_key, {})
            g = prev_c.get("weekly_growth")
            if g is not None:
                recent_growths.append(g)
        curr_g = cats[best_key].get("weekly_growth")
        if curr_g is not None:
            recent_growths.append(curr_g)
        if len(recent_growths) >= 2 and all(g > 0 for g in recent_growths[-2:]):
            label = cats[best_key]["label"]
            insights.append(
                f"Momentum haussier sur 2+ semaines consécutives pour les fonds {label}."
            )

    return insights[:6]   # cap at 6


# ── JSON persistence ──────────────────────────────────────────────────────────

def load_history() -> list[dict]:
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE, encoding="utf-8") as f:
            return json.load(f)
    return []


def save_history(history: list[dict], new_entry: dict) -> None:
    # Deduplicate by date
    history = [h for h in history if h["date"] != new_entry["date"]]
    history.append(new_entry)
    history.sort(key=lambda h: h["date"])

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)
    with open(LATEST_FILE, "w", encoding="utf-8") as f:
        json.dump(new_entry, f, ensure_ascii=False, indent=2)

    log.info(
        "Saved %d entries to history.json; latest = %s",
        len(history),
        new_entry["date"],
    )


# ── Pipeline orchestrator ─────────────────────────────────────────────────────

async def run_pipeline(force: bool = False) -> bool:
    """
    Full pipeline: download → parse → compute → save.
    Returns True on success.
    """
    import asyncio

    log.info("=== AMMC OPCVM Pipeline starting ===")

    content, filename = await download_latest_xls()
    if not content:
        log.error("Download failed — aborting pipeline")
        return False

    raw = parse_ammc_xls(content, filename or "")
    if not raw:
        log.error("Parsing failed — aborting pipeline")
        return False

    history = load_history()

    # Skip if we already have this date
    if not force and any(h["date"] == raw["raw_date"] for h in history):
        log.info("Data for %s already in history — skipping (use --force to override)", raw["raw_date"])
        return True

    entry = compute_metrics(raw, history)
    save_history(history, entry)

    log.info("=== Pipeline complete for %s ===", entry["date"])
    return True


# ── CLI entry point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import asyncio

    force = "--force" in sys.argv
    success = asyncio.run(run_pipeline(force=force))
    sys.exit(0 if success else 1)
