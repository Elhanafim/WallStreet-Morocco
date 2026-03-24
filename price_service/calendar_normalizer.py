"""
Translation and normalisation helpers for calendar events.
All event titles are translated to French using EVENT_TRANSLATIONS.
"""

import hashlib
from datetime import datetime, timezone
from typing import Optional

import pytz

CASABLANCA_TZ = pytz.timezone("Africa/Casablanca")

# ── 70+ English → French translation map ─────────────────────────────────────

EVENT_TRANSLATIONS: dict[str, str] = {
    # Monetary Policy
    "Interest Rate Decision": "Décision de taux directeur",
    "Fed Interest Rate Decision": "Décision de taux Fed",
    "ECB Interest Rate Decision": "Décision de taux BCE",
    "BoE Interest Rate Decision": "Décision de taux BoE",
    "BoJ Interest Rate Decision": "Décision de taux BoJ",
    "FOMC Meeting": "Réunion FOMC",
    "FOMC Statement": "Communiqué FOMC",
    "FOMC Minutes": "Procès-verbal FOMC",
    "Fed Minutes": "Procès-verbal Fed",
    "ECB Press Conference": "Conférence de presse BCE",
    "ECB Monetary Policy Statement": "Déclaration de politique monétaire BCE",
    "Monetary Policy Summary": "Résumé de politique monétaire",
    "Monetary Policy Meeting Minutes": "Procès-verbal réunion monétaire",
    "Bank Al-Maghrib Rate Decision": "Décision de taux Bank Al-Maghrib",
    "BAM Monetary Policy": "Politique monétaire BAM",
    "Federal Reserve Meeting": "Réunion Réserve Fédérale",
    # Inflation
    "CPI m/m": "Inflation mensuelle (IPC)",
    "CPI y/y": "Inflation annuelle (IPC)",
    "Core CPI m/m": "Inflation cœur mensuelle",
    "Core CPI y/y": "Inflation cœur annuelle",
    "PCE Price Index m/m": "Indice PCE mensuel",
    "Core PCE Price Index m/m": "Indice PCE cœur mensuel",
    "PPI m/m": "Prix producteurs mensuel (IPP)",
    "PPI y/y": "Prix producteurs annuel (IPP)",
    "Flash CPI y/y": "Flash inflation annuelle",
    "CPI Flash Estimate y/y": "Estimation flash IPC",
    "Consumer Price Index": "Indice des Prix à la Consommation (IPC)",
    "Producer Price Index": "Indice des Prix Producteurs (IPP)",
    # Employment
    "Non-Farm Payrolls": "Créations d'emplois NFP (USA)",
    "Non-Farm Employment Change": "Variation emploi NFP",
    "Unemployment Rate": "Taux de chômage",
    "ADP Non-Farm Employment Change": "Emploi privé ADP",
    "Average Hourly Earnings m/m": "Salaires horaires moyens (mensuel)",
    "Claimant Count Change": "Demandeurs d'emploi (UK)",
    "Jobless Claims": "Inscriptions chômage",
    "Initial Jobless Claims": "Nouvelles demandes chômage",
    "Continuing Jobless Claims": "Demandes chômage continues",
    "Employment Change": "Variation de l'emploi",
    "Participation Rate": "Taux de participation",
    # GDP / Growth
    "GDP m/m": "PIB mensuel",
    "GDP q/q": "PIB trimestriel",
    "GDP y/y": "PIB annuel",
    "Preliminary GDP q/q": "PIB préliminaire trimestriel",
    "Final GDP q/q": "PIB final trimestriel",
    "Flash GDP q/q": "Flash PIB trimestriel",
    "GDP Growth Rate": "Taux de croissance PIB",
    "Gross Domestic Product": "Produit Intérieur Brut (PIB)",
    # Trade
    "Trade Balance": "Balance commerciale",
    "Current Account": "Compte courant",
    "Imports": "Importations",
    "Exports": "Exportations",
    "Retail Sales m/m": "Ventes au détail (mensuel)",
    "Core Retail Sales m/m": "Ventes détail cœur",
    "Retail Sales y/y": "Ventes au détail (annuel)",
    # PMI / Business
    "Manufacturing PMI": "PMI Industrie",
    "Services PMI": "PMI Services",
    "Composite PMI": "PMI Composite",
    "Flash Manufacturing PMI": "Flash PMI Industrie",
    "Flash Services PMI": "Flash PMI Services",
    "ISM Manufacturing PMI": "ISM Industrie (USA)",
    "ISM Non-Manufacturing PMI": "ISM Services (USA)",
    "Business Climate": "Climat des affaires",
    "ZEW Economic Sentiment": "Sentiment ZEW",
    # Consumer
    "Consumer Confidence": "Confiance des consommateurs",
    "Consumer Sentiment": "Sentiment consommateurs",
    "Empire State Manufacturing Index": "Indice manufacturier NY Fed",
    "Philadelphia Fed Manufacturing Index": "Indice manufacturier Philly Fed",
    # Commodities / Oil
    "Crude Oil Inventories": "Stocks pétrole brut (USA)",
    "EIA Crude Oil Stocks Change": "Variation stocks EIA",
    "Baker Hughes Oil Rig Count": "Forages pétroliers Baker Hughes",
    # Industrial
    "Industrial Production m/m": "Production industrielle (mensuel)",
    "Industrial Production y/y": "Production industrielle (annuel)",
    # Central Bank reports
    "FOMC Economic Projections": "Projections économiques FOMC",
    "ECB Economic Bulletin": "Bulletin économique BCE",
    # Other
    "Durable Goods Orders m/m": "Commandes biens durables",
    "Housing Starts": "Mises en chantier",
    "Building Permits": "Permis de construire",
    "New Home Sales": "Ventes de logements neufs",
    "Existing Home Sales": "Ventes de logements existants",
    "CB Consumer Confidence": "Confiance CB des consommateurs",
    "Personal Income m/m": "Revenus personnels (mensuel)",
    "Personal Spending m/m": "Dépenses personnelles (mensuel)",
}

# ── Country mapping ───────────────────────────────────────────────────────────

COUNTRY_FLAGS: dict[str, str] = {
    "MA": "🇲🇦", "US": "🇺🇸", "EU": "🇪🇺", "FR": "🇫🇷",
    "DE": "🇩🇪", "GB": "🇬🇧", "CN": "🇨🇳", "SA": "🇸🇦",
    "JP": "🇯🇵", "AU": "🇦🇺", "CA": "🇨🇦", "CH": "🇨🇭",
    "NZ": "🇳🇿", "EMU": "🇪🇺",
}

COUNTRY_CURRENCIES: dict[str, str] = {
    "MA": "MAD", "US": "USD", "EU": "EUR", "FR": "EUR",
    "DE": "EUR", "GB": "GBP", "CN": "CNY", "SA": "SAR",
    "JP": "JPY", "AU": "AUD", "CA": "CAD", "CH": "CHF",
    "EMU": "EUR",
}

# ForexFactory country → ISO code
FF_COUNTRY_MAP: dict[str, str] = {
    "USD": "US", "EUR": "EU", "GBP": "GB", "JPY": "JP",
    "AUD": "AU", "CAD": "CA", "CHF": "CH", "CNY": "CN",
    "NZD": "NZ", "MAD": "MA",
}

# ForexFactory impact string → base score
FF_IMPACT_MAP: dict[str, int] = {
    "Low": 1, "Medium": 2, "High": 3, "Holiday": 1,
}

# Finnhub impact int → base score
FH_IMPACT_MAP: dict[int, int] = {1: 1, 2: 2, 3: 3}

# ── Translation helpers ────────────────────────────────────────────────────────

def translate_title(title: str) -> str:
    """Return French translation if available, else the original title."""
    # Exact match first
    if title in EVENT_TRANSLATIONS:
        return EVENT_TRANSLATIONS[title]
    # Partial match — check if any key is a substring of title
    for en, fr in EVENT_TRANSLATIONS.items():
        if en.lower() in title.lower():
            return fr
    return title  # keep original if no match


# ── ID generation ─────────────────────────────────────────────────────────────

def make_event_id(source: str, title: str, date: str, country: str) -> str:
    raw = f"{source}:{title.lower().strip()}:{date[:10]}:{country}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]


# ── Date helpers ──────────────────────────────────────────────────────────────

def parse_iso(dt_str: str) -> Optional[datetime]:
    if not dt_str:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S",
                "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(dt_str[:19], fmt[:len(fmt)])
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None


def is_upcoming(date_str: str) -> bool:
    now = datetime.now(timezone.utc)
    dt = parse_iso(date_str)
    return dt is not None and dt > now


def is_past(date_str: str) -> bool:
    now = datetime.now(timezone.utc)
    dt = parse_iso(date_str)
    return dt is not None and dt <= now


# ── Normalised event builder ──────────────────────────────────────────────────

def build_event(
    *,
    source: str,
    source_name: str,
    source_url: str,
    title: str,
    date: str,
    country: str,
    impact_score: int,
    impact_label: str,
    impact_color: str,
    category: str,
    currency: str = "",
    time: Optional[str] = None,
    actual: Optional[str] = None,
    forecast: Optional[str] = None,
    previous: Optional[str] = None,
    unit: Optional[str] = None,
    summary: Optional[str] = None,
    is_morocco_relevant: bool = False,
) -> dict:
    country_upper = country.upper()
    flag = COUNTRY_FLAGS.get(country_upper, "🌍")
    if not currency:
        currency = COUNTRY_CURRENCIES.get(country_upper, "")
    title_fr = translate_title(title)
    event_id = make_event_id(source, title, date, country)
    return {
        "id": event_id,
        "title": title_fr,
        "titleFr": title_fr,
        "date": date,
        "time": time,
        "country": country_upper,
        "countryFlag": flag,
        "currency": currency,
        "category": category,
        "impactScore": max(1, min(5, impact_score)),
        "impactLabel": impact_label,
        "impactColor": impact_color,
        "actual": actual or None,
        "forecast": forecast or None,
        "previous": previous or None,
        "unit": unit,
        "summary": summary,
        "sourceUrl": source_url,
        "sourceName": source_name,
        "isUpcoming": is_upcoming(date),
        "isPast": is_past(date),
        "isMoroccoRelevant": is_morocco_relevant,
    }
