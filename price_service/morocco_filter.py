"""
Morocco market relevance scoring and impact normalization.
"""

from typing import Optional

# ── Keywords that make any event Morocco-relevant ─────────────────────────────

MOROCCO_KEYWORDS: list[str] = [
    "maroc", "morocco", "bam", "bank al-maghrib", "hcp", "casablanca",
    "masi", "mad", "dirham", "bvc", "cdg", "attijariwafa", "bmce",
    "cih", "wafa", "cosumar", "iam", "itissalat", "managem",
    "lafarge", "sni", "ocp", "sogea",
]

# Countries whose macro data strongly influences Moroccan markets
MACRO_INFLUENCER_COUNTRIES = {"US", "EU", "FR", "DE", "GB", "CN", "SA"}

# Event categories that directly affect MAD-denominated assets or BAM decisions
HIGH_RELEVANCE_CATEGORIES: set[str] = {
    "monetary_policy", "inflation", "oil", "commodities",
}

# ── Commodities relevant to Morocco (OCP = phosphates; energy imports) ─────────

COMMODITY_KEYWORDS: list[str] = [
    "crude oil", "pétrole", "gold", "or ", "silver", "argent",
    "phosphate", "wheat", "blé", "fertilizer", "engrais",
]


# ── Impact normalisation ───────────────────────────────────────────────────────

def normalize_impact(
    raw_impact: int,
    country: str,
    category: str,
    title: str,
) -> int:
    """
    Convert raw 1-3 impact score from sources to a 1-5 internal scale.
    Applies Morocco-relevance boosts.
    """
    # Base mapping: source uses 1-3, we use 1-5
    base: int = {1: 1, 2: 3, 3: 5}.get(raw_impact, raw_impact)

    country_upper = country.upper()
    title_lower = title.lower()
    cat_lower = category.lower()

    # Boost for G7/major currency events that ripple into MAD
    if base >= 3 and country_upper in MACRO_INFLUENCER_COUNTRIES:
        base = min(5, base + 1)

    # Boost for commodities (OCP = world's largest phosphate exporter; oil importer)
    if any(kw in title_lower for kw in COMMODITY_KEYWORDS):
        base = min(5, base + 1)

    # Cap holiday / filler events
    if cat_lower == "holiday":
        base = min(2, base)

    return max(1, min(5, base))


def impact_label(score: int) -> str:
    return {1: "Faible", 2: "Modéré", 3: "Moyen", 4: "Élevé", 5: "Critique"}.get(score, "Moyen")


def impact_color(score: int) -> str:
    return {
        1: "gray", 2: "blue", 3: "yellow", 4: "orange", 5: "red",
    }.get(score, "gray")


# ── Morocco relevance ──────────────────────────────────────────────────────────

def is_morocco_relevant(
    country: str,
    impact_score: int,
    title: str,
    category: str,
) -> bool:
    """
    Return True if this event is relevant to Moroccan investors.
    Criteria:
      1. Directly Moroccan (country == MA)
      2. High-impact macro from major economy (score ≥ 4)
      3. Contains Morocco-specific keyword
      4. Commodity event (OCP, oil, gold)
      5. Monetary policy from BAM or Fed / ECB (score ≥ 3)
    """
    country_upper = country.upper()
    title_lower = title.lower()
    cat_lower = category.lower()

    if country_upper == "MA":
        return True

    if impact_score >= 4:
        return True

    if any(kw in title_lower for kw in MOROCCO_KEYWORDS):
        return True

    if any(kw in title_lower for kw in COMMODITY_KEYWORDS):
        return True

    if cat_lower in HIGH_RELEVANCE_CATEGORIES and impact_score >= 3:
        return True

    return False


# ── Category inference ─────────────────────────────────────────────────────────

_CATEGORY_RULES: list[tuple[list[str], str]] = [
    (["rate", "taux", "monetary", "monétaire", "fomc", "bce", "ecb", "boe", "boj", "bam", "fed"], "monetary_policy"),
    (["cpi", "pce", "inflation", "ipc", "prix"], "inflation"),
    (["gdp", "pib", "growth", "croissance"], "gdp"),
    (["employment", "emploi", "payroll", "chômage", "unemployment", "jobless", "nfp", "adp"], "employment"),
    (["pmi", "ism", "manufacturing", "industrie", "services"], "pmi"),
    (["trade", "commerce", "balance commerciale", "current account"], "trade"),
    (["retail", "ventes", "consumer confidence", "confiance"], "consumer"),
    (["oil", "pétrole", "crude", "eia", "baker hughes"], "oil"),
    (["gold", "or ", "silver", "argent", "commodity", "matière"], "commodities"),
    (["housing", "logement", "home sales", "building permits"], "housing"),
    (["holiday", "férié", "fête"], "holiday"),
    (["hcp", "haut commissariat"], "statistics"),
    (["bvc", "bourse", "casablanca exchange", "ipo", "introduction"], "market"),
    (["results", "résultats", "earnings", "bénéfices"], "earnings"),
]


def infer_category(title: str, default: str = "macro") -> str:
    t = title.lower()
    for keywords, cat in _CATEGORY_RULES:
        if any(kw in t for kw in keywords):
            return cat
    return default
