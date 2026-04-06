"""
OPCVM data scraper — three-source fallback chain:
  Source A: medias24.com/leboursier/opcvm-variations (ASFIM data, most complete)
  Source B: opcvm-maroc.ma (HTML table, may be JS-rendered)
  Source C: data.gov.ma AMMC official weekly XLS (most reliable static source)
"""

import io
import logging
import re
from datetime import datetime
from typing import Optional

import httpx
from bs4 import BeautifulSoup

log = logging.getLogger("opcvm-scraper")

# ── Browser-like headers to bypass 403 ───────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
    "Referer": "https://www.google.com/",
}

DATAGOV_URLS = [
    "https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2026",
    "https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2025",
]

CATEGORY_MAP = {
    "action":       "Actions",
    "actions":      "Actions",
    "diversifie":   "Diversifiés",
    "diversifies":  "Diversifiés",
    "monetaire":    "Monétaires",
    "monetaires":   "Monétaires",
    "obligataire":  "Obligataires",
    "obligataires": "Obligataires",
    "contractuel":  "Contractuels",
    "contractuels": "Contractuels",
}


def parse_float(val) -> Optional[float]:
    if val is None:
        return None
    cleaned = (
        str(val)
        .replace("\xa0", "")
        .replace("\u202f", "")
        .replace(" ", "")
        .replace(",", ".")
        .replace("%", "")
        .strip()
    )
    if not cleaned or cleaned in ("-", "—", "nan", "None", ""):
        return None
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def normalize_category(raw: str) -> str:
    key = (
        raw.lower()
        .strip()
        .replace("é", "e")
        .replace("è", "e")
        .replace("â", "a")
        .replace("î", "i")
    )
    return CATEGORY_MAP.get(key, raw.strip())


# ── Source A: medias24.com/leboursier/opcvm-variations ───────────────────────

async def scrape_medias24_opcvm() -> tuple[list[dict], Optional[str]]:
    """
    Scrape medias24.com/leboursier/opcvm-variations (ASFIM data).
    Returns (funds_list, data_date).
    """
    url = "https://medias24.com/leboursier/opcvm-variations"
    source = "medias24.com/leboursier (ASFIM)"
    all_funds: list[dict] = []
    data_date: Optional[str] = None

    try:
        async with httpx.AsyncClient(
            timeout=20,
            headers=HEADERS,
            follow_redirects=True,
        ) as client:
            # Visit homepage first to get cookies (mimics browser navigation)
            try:
                await client.get("https://medias24.com", timeout=8)
            except Exception:
                pass

            response = await client.get(url)
            if response.status_code != 200:
                log.warning("[scraper-A] medias24 returned HTTP %d", response.status_code)
                return [], None

            soup = BeautifulSoup(response.text, "lxml")

            # ── Extract data date ────────────────────────────────────────────
            for tag in soup.find_all(string=True):
                match = re.search(r"\d{2}/\d{2}/\d{4}", str(tag))
                if match:
                    data_date = match.group(0)
                    break

            # ── Strategy: find category headers + tables ─────────────────────
            # Page uses tabs or sections per OPCVM type.
            # Walk the DOM looking for headings that name a category.
            current_category = "Inconnu"

            for element in soup.find_all(["h1", "h2", "h3", "h4", "h5", "div", "span", "li", "a"]):
                text = element.get_text(strip=True)
                norm = normalize_category(text)
                if norm in CATEGORY_MAP.values():
                    current_category = norm

                # If this element contains a table, parse it
                table = element.find_next("table")
                if table and element.name in ("h1", "h2", "h3", "h4", "h5"):
                    rows = table.find_all("tr")
                    for row in rows:
                        cells = row.find_all(["td", "th"])
                        if len(cells) < 3:
                            continue
                        texts = [c.get_text(strip=True) for c in cells]

                        # Skip header rows
                        if any(
                            kw in texts[0].lower()
                            for kw in ["nom", "fonds", "opcvm", "libellé", "name", "type", "gérant"]
                        ):
                            continue

                        fund = {
                            "type":            current_category,
                            "name":            texts[0] if texts else "",
                            "societe_gestion": texts[1] if len(texts) > 1 else None,
                            "vl":              parse_float(texts[2]) if len(texts) > 2 else None,
                            "var_jour":        parse_float(texts[3]) if len(texts) > 3 else None,
                            "perf_1m":         parse_float(texts[4]) if len(texts) > 4 else None,
                            "perf_ytd":        parse_float(texts[5]) if len(texts) > 5 else None,
                            "perf_1an":        parse_float(texts[6]) if len(texts) > 6 else None,
                            "encours":         parse_float(texts[7]) if len(texts) > 7 else None,
                            "source":          source,
                        }
                        if fund["name"] and len(fund["name"]) > 2 and fund["vl"] is not None:
                            all_funds.append(fund)

            # ── Fallback: parse ALL tables if heading strategy got 0 results ──
            if not all_funds:
                tables = soup.find_all("table")
                for table in tables:
                    # Try to find category from nearest preceding heading
                    prev = table.find_previous(["h1", "h2", "h3", "h4", "h5"])
                    if prev:
                        norm = normalize_category(prev.get_text(strip=True))
                        if norm in CATEGORY_MAP.values():
                            current_category = norm

                    rows = table.find_all("tr")
                    for row in rows:
                        cells = row.find_all(["td", "th"])
                        if len(cells) < 3:
                            continue
                        texts = [c.get_text(strip=True) for c in cells]
                        if any(
                            kw in (texts[0] or "").lower()
                            for kw in ["nom", "fonds", "opcvm", "libellé", "name", "type", "gérant"]
                        ):
                            continue

                        fund = {
                            "type":            current_category,
                            "name":            texts[0] if texts else "",
                            "societe_gestion": texts[1] if len(texts) > 1 else None,
                            "vl":              parse_float(texts[2]) if len(texts) > 2 else None,
                            "var_jour":        parse_float(texts[3]) if len(texts) > 3 else None,
                            "perf_1m":         parse_float(texts[4]) if len(texts) > 4 else None,
                            "perf_ytd":        parse_float(texts[5]) if len(texts) > 5 else None,
                            "perf_1an":        parse_float(texts[6]) if len(texts) > 6 else None,
                            "encours":         parse_float(texts[7]) if len(texts) > 7 else None,
                            "source":          source,
                        }
                        if fund["name"] and len(fund["name"]) > 2 and fund["vl"] is not None:
                            all_funds.append(fund)

            log.info("[scraper-A] medias24: %d funds (date: %s)", len(all_funds), data_date)
            return all_funds, data_date

    except Exception as exc:
        log.warning("[scraper-A] Error: %s", exc)
        return [], None


# ── Source B: opcvm-maroc.ma ─────────────────────────────────────────────────

async def scrape_opcvm_maroc() -> list[dict]:
    source = "opcvm-maroc.ma"
    try:
        async with httpx.AsyncClient(timeout=15, headers=HEADERS, follow_redirects=True) as client:
            resp = await client.get("https://www.opcvm-maroc.ma/index.php/fr/")
            soup = BeautifulSoup(resp.text, "lxml")
            rows = soup.select("table tbody tr")
            if not rows:
                log.info("[scraper-B] No table rows found on opcvm-maroc.ma")
                return []
            funds = []
            for row in rows:
                cells = [td.get_text(strip=True) for td in row.select("td")]
                if len(cells) >= 7:
                    fund = {
                        "type":            cells[0] or None,
                        "name":            cells[1] or None,
                        "societe_gestion": cells[2] or None,
                        "vl":              parse_float(cells[3]),
                        "var_jour":        None,
                        "perf_1m":         parse_float(cells[4]),
                        "perf_ytd":        parse_float(cells[5]),
                        "perf_1an":        parse_float(cells[6]),
                        "encours":         parse_float(cells[7]) if len(cells) > 7 else None,
                        "source":          source,
                    }
                    if fund["name"]:
                        funds.append(fund)
            log.info("[scraper-B] opcvm-maroc.ma: %d funds", len(funds))
            return funds
    except Exception as exc:
        log.warning("[scraper-B] Error: %s", exc)
        return []


# ── Source C: data.gov.ma AMMC XLS ──────────────────────────────────────────

async def _find_latest_xls_url(client: httpx.AsyncClient) -> Optional[str]:
    for dataset_url in DATAGOV_URLS:
        try:
            page = await client.get(dataset_url)
            soup = BeautifulSoup(page.text, "lxml")
            links = [
                a["href"] for a in soup.select("a[href]")
                if str(a.get("href", "")).endswith((".xls", ".xlsx"))
            ]
            if links:
                xls_url = links[-1]
                if not xls_url.startswith("http"):
                    xls_url = "https://data.gov.ma" + xls_url
                log.info("[scraper-C] XLS found: %s", xls_url)
                return xls_url
        except Exception as exc:
            log.warning("[scraper-C] Could not fetch %s: %s", dataset_url, exc)
    return None


async def scrape_datagov_opcvm() -> list[dict]:
    source = "data.gov.ma (AMMC)"
    try:
        import pandas as pd
        async with httpx.AsyncClient(timeout=30, headers=HEADERS, follow_redirects=True) as client:
            xls_url = await _find_latest_xls_url(client)
            if not xls_url:
                log.warning("[scraper-C] No XLS URL found on data.gov.ma")
                return []

            xls_resp = await client.get(xls_url)
            xls_resp.raise_for_status()

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
                log.warning("[scraper-C] Could not parse XLS content")
                return []

            funds = []
            for _, row in df.iterrows():
                try:
                    name = str(row.iloc[1]).strip() if len(row) > 1 else ""
                    if not name or name.lower() in ("nan", "nom", "fonds", ""):
                        continue
                    type_raw = str(row.iloc[0]).strip() if len(row) > 0 else ""
                    if type_raw.lower() in ("nan", "type", "catégorie"):
                        continue
                    fund = {
                        "type":            normalize_category(type_raw),
                        "name":            name,
                        "societe_gestion": str(row.iloc[2]).strip() if len(row) > 2 else None,
                        "vl":              parse_float(str(row.iloc[3])) if len(row) > 3 else None,
                        "var_jour":        None,
                        "perf_1m":         parse_float(str(row.iloc[4])) if len(row) > 4 else None,
                        "perf_ytd":        parse_float(str(row.iloc[5])) if len(row) > 5 else None,
                        "perf_1an":        parse_float(str(row.iloc[6])) if len(row) > 6 else None,
                        "encours":         parse_float(str(row.iloc[7])) if len(row) > 7 else None,
                        "source":          source,
                    }
                    funds.append(fund)
                except Exception:
                    continue

            log.info("[scraper-C] data.gov.ma: %d funds", len(funds))
            return funds
    except Exception as exc:
        log.warning("[scraper-C] Error: %s", exc)
        return []


# ── Main entry point with fallback chain ──────────────────────────────────────

async def get_opcvm_data() -> dict:
    """
    Fetch OPCVM data with a three-source fallback chain:
    medias24.com → opcvm-maroc.ma → data.gov.ma (AMMC XLS)
    """
    # Source A: medias24.com (primary — most complete, has var_jour)
    funds, data_date = await scrape_medias24_opcvm()
    if funds:
        return _build_result(funds, "medias24.com/leboursier (ASFIM)", data_date)

    log.info("[OPCVM] Source A failed, trying Source B...")

    # Source B: opcvm-maroc.ma
    funds = await scrape_opcvm_maroc()
    if funds:
        return _build_result(funds, "opcvm-maroc.ma", None)

    log.info("[OPCVM] Source B failed, trying Source C...")

    # Source C: data.gov.ma AMMC XLS
    funds = await scrape_datagov_opcvm()
    if funds:
        return _build_result(funds, "data.gov.ma (AMMC)", None)

    log.error("[OPCVM] All sources failed")
    return {
        "funds": [],
        "count": 0,
        "total": 0,
        "source": "unavailable",
        "data_date": None,
        "last_updated": datetime.now().isoformat(),
        "by_type": {},
        "error": True,
    }


def _build_result(funds: list[dict], source: str, data_date: Optional[str]) -> dict:
    by_type: dict[str, int] = {}
    for f in funds:
        t = f.get("type") or "Autre"
        by_type[t] = by_type.get(t, 0) + 1

    return {
        "funds":        funds,
        "count":        len(funds),
        "total":        len(funds),
        "source":       source,
        "data_date":    data_date,
        "last_updated": datetime.now().isoformat(),
        "by_type":      by_type,
        "error":        False,
    }
