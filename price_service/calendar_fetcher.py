"""
Multi-source economic calendar fetcher.
Sources: Finnhub, ForexFactory, Bank Al-Maghrib, HCP Morocco, Médias24 RSS, Boursenews RSS.
All results normalized via calendar_normalizer.build_event().
"""

import asyncio
import logging
import os
import re
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Union
from urllib.parse import urljoin

import requests

from calendar_normalizer import (
    FF_COUNTRY_MAP, FF_IMPACT_MAP, FH_IMPACT_MAP,
    build_event, make_event_id,
)
from morocco_filter import (
    impact_color, impact_label, infer_category,
    is_morocco_relevant, normalize_impact,
)

log = logging.getLogger("calendar-fetcher")

TIMEOUT = 12  # seconds per HTTP request


# ── HTTP helper ────────────────────────────────────────────────────────────────

def _get(url: str, params: Optional[dict] = None, headers: Optional[dict] = None) -> Optional[Union[dict, list, str]]:
    try:
        r = requests.get(url, params=params, headers=headers, timeout=TIMEOUT)
        r.raise_for_status()
        ct = r.headers.get("content-type", "")
        if "json" in ct:
            return r.json()
        return r.text
    except Exception as exc:
        log.warning("HTTP error %s: %s", url, exc)
        return None


# ── 1. Finnhub Economic Calendar ──────────────────────────────────────────────

FINNHUB_BASE = "https://finnhub.io/api/v1"


def fetch_finnhub(from_date: str, to_date: str) -> list[dict]:
    api_key = os.getenv("FINNHUB_API_KEY", "")
    if not api_key:
        log.warning("FINNHUB_API_KEY not set — skipping Finnhub")
        return []

    data = _get(
        f"{FINNHUB_BASE}/calendar/economic",
        params={"from": from_date, "to": to_date, "token": api_key},
    )
    if not isinstance(data, dict):
        return []

    events = data.get("economicCalendar", [])
    result = []
    for ev in events:
        country = str(ev.get("country", "")).upper()
        title = str(ev.get("event", "")).strip()
        date = str(ev.get("time", ""))[:10]
        time_str = str(ev.get("time", ""))[11:16] or None
        raw_impact = int(ev.get("impact", 1))
        base_score = FH_IMPACT_MAP.get(raw_impact, 1)
        category = infer_category(title)
        score = normalize_impact(base_score, country, category, title)
        morocco = is_morocco_relevant(country, score, title, category)

        result.append(build_event(
            source="finnhub",
            source_name="Finnhub",
            source_url=f"https://finnhub.io/dashboard#calendar",
            title=title,
            date=date,
            country=country,
            impact_score=score,
            impact_label=impact_label(score),
            impact_color=impact_color(score),
            category=category,
            time=time_str,
            actual=str(ev.get("actual", "")) or None,
            forecast=str(ev.get("estimate", "")) or None,
            previous=str(ev.get("prev", "")) or None,
            unit=str(ev.get("unit", "")) or None,
            is_morocco_relevant=morocco,
        ))
    log.info("Finnhub: fetched %d events", len(result))
    return result


# ── 2. ForexFactory JSON feed ──────────────────────────────────────────────────

FF_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"


def fetch_forexfactory() -> list[dict]:
    data = _get(FF_URL)
    if not isinstance(data, list):
        return []

    result = []
    for ev in data:
        # ForexFactory JSON uses "country" field for the currency code (e.g. "USD", "EUR")
        currency = str(ev.get("country", ev.get("currency", ""))).upper()
        country = FF_COUNTRY_MAP.get(currency, currency[:2] if len(currency) >= 2 else "XX")
        title = str(ev.get("title", "")).strip()
        date_raw = str(ev.get("date", ""))
        # FF date format: "03-24-2026" or ISO
        date = _parse_ff_date(date_raw)
        if not date:
            continue
        time_str = str(ev.get("time", "")) or None
        impact_raw = str(ev.get("impact", "Low"))
        base_score = FF_IMPACT_MAP.get(impact_raw, 1)
        category = infer_category(title)
        score = normalize_impact(base_score, country, category, title)
        morocco = is_morocco_relevant(country, score, title, category)

        result.append(build_event(
            source="forexfactory",
            source_name="ForexFactory",
            source_url="https://www.forexfactory.com/calendar",
            title=title,
            date=date,
            country=country,
            impact_score=score,
            impact_label=impact_label(score),
            impact_color=impact_color(score),
            category=category,
            currency=currency,
            time=time_str,
            actual=str(ev.get("actual", "")) or None,
            forecast=str(ev.get("forecast", "")) or None,
            previous=str(ev.get("previous", "")) or None,
            is_morocco_relevant=morocco,
        ))
    log.info("ForexFactory: fetched %d events", len(result))
    return result


def _parse_ff_date(raw: str) -> Optional[str]:
    """Convert ForexFactory date strings to YYYY-MM-DD."""
    raw = raw.strip()
    # ISO already
    if re.match(r"\d{4}-\d{2}-\d{2}", raw):
        return raw[:10]
    # MM-DD-YYYY
    m = re.match(r"(\d{1,2})-(\d{1,2})-(\d{4})", raw)
    if m:
        return f"{m.group(3)}-{m.group(1).zfill(2)}-{m.group(2).zfill(2)}"
    # "Monday Mar 24 2026" style
    for fmt in ("%A %b %d %Y", "%a %b %d %Y", "%B %d, %Y"):
        try:
            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None


# ── 3. Bank Al-Maghrib (BAM) ──────────────────────────────────────────────────

BAM_URL = "https://www.bkam.ma/Politique-monetaire/Cadre-strategique/Decision-de-la-politique-monetaire/Historique-des-decisions"


def fetch_bam() -> list[dict]:
    """Scrape BAM monetary policy decision dates."""
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        log.warning("beautifulsoup4 not installed — skipping BAM scraper")
        return []

    html = _get(BAM_URL)
    if not isinstance(html, str):
        return []

    soup = BeautifulSoup(html, "lxml")
    result = []

    # BAM lists decision dates in a table or list; look for year patterns
    # Pattern: find any text that looks like a meeting date
    # French date pattern: "24 mars 2026" or "4 octobre 2022"
    date_pattern = re.compile(r"\b(\d{1,2})\s+([\w\u00e0-\u00ff]+)\s+(20\d{2})\b", re.UNICODE)
    seen: set[str] = set()

    for tag in soup.find_all(["td", "li", "p", "h4", "h3", "a", "span"]):
        text = tag.get_text(separator=" ", strip=True)
        m = date_pattern.search(text)
        if not m:
            continue
        raw_date = f"{m.group(1)} {m.group(2)} {m.group(3)}"
        date_str = _parse_arabic_or_french_date(raw_date)
        if not date_str or date_str in seen:
            continue
        seen.add(date_str)

        score = 5
        result.append(build_event(
            source="bam",
            source_name="Bank Al-Maghrib",
            source_url=BAM_URL,
            title="Bank Al-Maghrib Rate Decision",
            date=date_str,
            country="MA",
            impact_score=score,
            impact_label=impact_label(score),
            impact_color=impact_color(score),
            category="monetary_policy",
            currency="MAD",
            is_morocco_relevant=True,
        ))

    log.info("BAM: fetched %d events", len(result))
    return result


# ── 4. HCP Morocco Statistics ─────────────────────────────────────────────────

HCP_AGENDA_URL = "https://www.hcp.ma/Calendrier-des-publications_r630.html"


def fetch_hcp() -> list[dict]:
    """Scrape HCP publication calendar."""
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        log.warning("beautifulsoup4 not installed — skipping HCP scraper")
        return []

    html = _get(HCP_AGENDA_URL)
    if not isinstance(html, str):
        return []

    soup = BeautifulSoup(html, "lxml")
    result = []
    seen: set[str] = set()

    # HCP publishes a table of upcoming releases
    for row in soup.select("table tr, .publication-item, article"):
        text = row.get_text(separator=" ", strip=True)
        if not text:
            continue

        # Find date
        date_m = re.search(
            r"(\d{1,2})[/\-\s](\d{1,2})[/\-\s](20\d{2})|"
            r"(\d{1,2})\s+(\w+)\s+(20\d{2})",
            text,
        )
        if not date_m:
            continue

        date_str = _parse_arabic_or_french_date(date_m.group(0))
        if not date_str or date_str in seen:
            continue
        seen.add(date_str)

        # Extract a title — use first <td> or <a> content
        title_tag = row.find("a") or row.find("td")
        title = title_tag.get_text(strip=True) if title_tag else "Publication HCP"
        if len(title) > 120:
            title = title[:120]
        title = title or "Publication HCP"

        score = 3
        result.append(build_event(
            source="hcp",
            source_name="HCP Maroc",
            source_url=HCP_AGENDA_URL,
            title=title,
            date=date_str,
            country="MA",
            impact_score=score,
            impact_label=impact_label(score),
            impact_color=impact_color(score),
            category="statistics",
            currency="MAD",
            is_morocco_relevant=True,
        ))

    log.info("HCP: fetched %d events", len(result))
    return result


def _parse_arabic_or_french_date(raw: str) -> Optional[str]:
    raw = raw.strip()
    # DD/MM/YYYY or DD-MM-YYYY
    m = re.match(r"(\d{1,2})[/\-](\d{1,2})[/\-](20\d{2})", raw)
    if m:
        return f"{m.group(3)}-{m.group(2).zfill(2)}-{m.group(1).zfill(2)}"
    # DD Month YYYY (French month names)
    months_fr = {
        "janvier": 1, "février": 2, "mars": 3, "avril": 4,
        "mai": 5, "juin": 6, "juillet": 7, "août": 8,
        "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12,
        "jan": 1, "fév": 2, "mar": 3, "avr": 4,
        "jun": 6, "jul": 7, "aoû": 8, "sep": 9, "oct": 10, "nov": 11, "déc": 12,
    }
    m2 = re.match(r"(\d{1,2})\s+([\w\u00e0-\u00ff]+)\s+(20\d{2})", raw.lower(), re.UNICODE)
    if m2:
        month_n = months_fr.get(m2.group(2))
        if month_n:
            return f"{m2.group(3)}-{str(month_n).zfill(2)}-{m2.group(1).zfill(2)}"
    return None


# ── 5 & 6. RSS Feeds (Médias24 + Boursenews) ──────────────────────────────────

RSS_FEEDS: list[dict] = [
    {
        "url": "https://medias24.com/feed/",
        "source": "medias24",
        "source_name": "Médias24",
        "source_url": "https://medias24.com/economie/",
        "country": "MA",
        "category": "news",
    },
    {
        "url": "https://boursenews.ma/feed",
        "source": "boursenews",
        "source_name": "BourseNews",
        "source_url": "https://boursenews.ma/",
        "country": "MA",
        "category": "market",
    },
    {
        "url": "https://www.hcp.ma/xml/syndication.rss",
        "source": "hcp",
        "source_name": "HCP Maroc",
        "source_url": "https://www.hcp.ma/",
        "country": "MA",
        "category": "statistics",
    },
]


def fetch_rss_feed(feed: dict) -> list[dict]:
    try:
        import feedparser
    except ImportError:
        log.warning("feedparser not installed — skipping RSS feed %s", feed["source"])
        return []

    parsed = feedparser.parse(feed["url"])
    result = []

    for entry in parsed.entries[:20]:  # cap at 20 per feed
        title = str(entry.get("title", "")).strip()
        if not title:
            continue

        # Date from published_parsed (struct_time) or published string
        date_str: Optional[str] = None
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            try:
                dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                date_str = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
            except Exception:
                pass
        if not date_str:
            date_str = str(entry.get("published", ""))

        if not date_str:
            continue

        # Build summary from description
        summary: Optional[str] = None
        if hasattr(entry, "summary"):
            raw_sum = re.sub(r"<[^>]+>", "", entry.summary).strip()
            summary = raw_sum[:300] if raw_sum else None

        link = str(entry.get("link", feed["source_url"]))
        category = infer_category(title, default=feed["category"])
        score = 2  # RSS news defaults to moderate
        if any(kw in title.lower() for kw in ["résultats", "ipo", "introduction", "dividende", "bourse"]):
            score = 3

        result.append(build_event(
            source=feed["source"],
            source_name=feed["source_name"],
            source_url=link,
            title=title,
            date=date_str[:10],
            country=feed["country"],
            impact_score=score,
            impact_label=impact_label(score),
            impact_color=impact_color(score),
            category=category,
            time=date_str[11:16] if len(date_str) > 10 else None,
            summary=summary,
            is_morocco_relevant=True,
        ))

    log.info("%s RSS: fetched %d items", feed["source_name"], len(result))
    return result


def fetch_all_rss() -> list[dict]:
    result: list[dict] = []
    for feed in RSS_FEEDS:
        result.extend(fetch_rss_feed(feed))
    return result


# ── Aggregator ────────────────────────────────────────────────────────────────

def _date_range(days_back: int = 3, days_forward: int = 14) -> tuple[str, str]:
    now = datetime.now(timezone.utc)
    return (
        (now - timedelta(days=days_back)).strftime("%Y-%m-%d"),
        (now + timedelta(days=days_forward)).strftime("%Y-%m-%d"),
    )


def _dedup(events: list[dict]) -> list[dict]:
    """Remove duplicate events by id, keeping the higher-impact version."""
    seen: dict[str, dict] = {}
    for ev in events:
        eid = ev["id"]
        if eid not in seen or ev["impactScore"] > seen[eid]["impactScore"]:
            seen[eid] = ev
    return list(seen.values())


async def fetch_all_events(
    days_back: int = 3,
    days_forward: int = 14,
) -> list[dict]:
    """
    Fetch from all 6 sources concurrently (using thread executor for blocking calls).
    Returns deduplicated, sorted list of events.
    """
    from_date, to_date = _date_range(days_back, days_forward)
    loop = asyncio.get_event_loop()

    tasks = [
        loop.run_in_executor(None, fetch_finnhub, from_date, to_date),
        loop.run_in_executor(None, fetch_forexfactory),
        loop.run_in_executor(None, fetch_bam),
        loop.run_in_executor(None, fetch_hcp),
        loop.run_in_executor(None, fetch_all_rss),
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    all_events: list[dict] = []
    source_names = ["finnhub", "forexfactory", "bam", "hcp", "rss"]
    for name, res in zip(source_names, results):
        if isinstance(res, Exception):
            log.error("Source %s failed: %s", name, res)
        elif isinstance(res, list):
            all_events.extend(res)

    deduped = _dedup(all_events)
    # Sort by date ascending, then by impact descending
    deduped.sort(key=lambda e: (e.get("date", ""), -e.get("impactScore", 0)))
    log.info("fetch_all_events: %d total after dedup", len(deduped))
    return deduped
