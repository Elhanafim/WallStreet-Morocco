"""
OPCVM data scraper with two-source fallback chain:
  Source A: opcvm-maroc.ma (HTML table, may be JS-rendered)
  Source B: data.gov.ma AMMC official weekly XLS (most reliable)
"""

import io
import logging
from datetime import datetime

import httpx
import pandas as pd
from bs4 import BeautifulSoup

log = logging.getLogger("opcvm-scraper")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Referer": "https://www.google.com",
}

# AMMC open-data dataset pages (try 2026 then fall back to 2025)
DATAGOV_URLS = [
    "https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2026",
    "https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2025",
]


def parse_float(val: str) -> float | None:
    try:
        cleaned = str(val).replace(",", ".").replace("%", "").replace("\xa0", "").replace(" ", "").strip()
        return float(cleaned)
    except Exception:
        return None


# ── Source A: opcvm-maroc.ma ─────────────────────────────────────────────────

async def scrape_opcvm_maroc() -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=15, headers=HEADERS, follow_redirects=True) as client:
            resp = await client.get("https://www.opcvm-maroc.ma/index.php/fr/")
            soup = BeautifulSoup(resp.text, "html.parser")
            rows = soup.select("table tbody tr")
            if not rows:
                log.info("[scraper-A] No table rows found — likely JS-rendered, falling through")
                return []
            funds = []
            for row in rows:
                cells = [td.get_text(strip=True) for td in row.select("td")]
                if len(cells) >= 7:
                    fund = {
                        "type": cells[0] or None,
                        "name": cells[1] or None,
                        "societe_gestion": cells[2] or None,
                        "vl": parse_float(cells[3]),
                        "perf_1m": parse_float(cells[4]),
                        "perf_ytd": parse_float(cells[5]),
                        "perf_1an": parse_float(cells[6]),
                        "encours": parse_float(cells[7]) if len(cells) > 7 else None,
                    }
                    if fund["name"]:
                        funds.append(fund)
            log.info(f"[scraper-A] Parsed {len(funds)} funds from opcvm-maroc.ma")
            return funds
    except Exception as exc:
        log.warning(f"[scraper-A] Error: {exc}")
        return []


# ── Source B: data.gov.ma AMMC XLS ──────────────────────────────────────────

async def _find_latest_xls_url(client: httpx.AsyncClient) -> str | None:
    """Scrape the AMMC dataset page to find the most recent XLS download URL."""
    for dataset_url in DATAGOV_URLS:
        try:
            page = await client.get(dataset_url)
            soup = BeautifulSoup(page.text, "html.parser")
            links = [
                a["href"] for a in soup.select("a[href]")
                if str(a.get("href", "")).endswith((".xls", ".xlsx"))
            ]
            if links:
                xls_url = links[-1]
                if not xls_url.startswith("http"):
                    xls_url = "https://data.gov.ma" + xls_url
                log.info(f"[scraper-B] Found XLS at {xls_url}")
                return xls_url
        except Exception as exc:
            log.warning(f"[scraper-B] Could not fetch {dataset_url}: {exc}")
    return None


async def scrape_datagov_opcvm() -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=30, headers=HEADERS, follow_redirects=True) as client:
            xls_url = await _find_latest_xls_url(client)
            if not xls_url:
                log.warning("[scraper-B] No XLS URL found on data.gov.ma")
                return []

            xls_resp = await client.get(xls_url)
            xls_resp.raise_for_status()

            # Try multiple sheets / skiprows to handle varying file structures
            content = io.BytesIO(xls_resp.content)
            df = None
            for skiprows in (3, 2, 1, 0):
                try:
                    df = pd.read_excel(content, sheet_name=0, skiprows=skiprows, header=0)
                    content.seek(0)
                    if df is not None and len(df) > 5:
                        break
                except Exception:
                    content.seek(0)

            if df is None or df.empty:
                log.warning("[scraper-B] Could not parse XLS content")
                return []

            funds = []
            for _, row in df.iterrows():
                try:
                    name = str(row.iloc[1]).strip() if len(row) > 1 else ""
                    if not name or name.lower() in ("nan", "nom", "fonds", ""):
                        continue
                    fund = {
                        "type": str(row.iloc[0]).strip() if len(row) > 0 else None,
                        "name": name,
                        "societe_gestion": str(row.iloc[2]).strip() if len(row) > 2 else None,
                        "vl": parse_float(str(row.iloc[3])) if len(row) > 3 else None,
                        "perf_1m": parse_float(str(row.iloc[4])) if len(row) > 4 else None,
                        "perf_ytd": parse_float(str(row.iloc[5])) if len(row) > 5 else None,
                        "perf_1an": parse_float(str(row.iloc[6])) if len(row) > 6 else None,
                        "encours": parse_float(str(row.iloc[7])) if len(row) > 7 else None,
                    }
                    # Skip rows that are clearly headers or totals
                    if fund["type"] and fund["type"].lower() in ("nan", "type", "catégorie"):
                        continue
                    funds.append(fund)
                except Exception:
                    continue

            log.info(f"[scraper-B] Parsed {len(funds)} funds from data.gov.ma XLS")
            return funds
    except Exception as exc:
        log.warning(f"[scraper-B] Error: {exc}")
        return []


# ── Main entry point ─────────────────────────────────────────────────────────

async def get_opcvm_data() -> dict:
    funds = await scrape_opcvm_maroc()
    source = "opcvm-maroc.ma"

    if not funds:
        funds = await scrape_datagov_opcvm()
        source = "data.gov.ma (AMMC)"

    return {
        "funds": funds,
        "source": source,
        "count": len(funds),
        "last_updated": datetime.now().isoformat(),
    }
