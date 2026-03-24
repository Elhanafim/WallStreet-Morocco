"""
BVC ticker mapping — StocksMA / Leboursier notation vs CSEMA (TradingView).

StocksMA uses the same 3-letter codes as our system for most tickers.
This module handles edge cases and provides the canonical ticker list.

Source: sm.get_tickers() output (all 69 currently-listed BVC stocks)
"""

# All 69 BVC tickers as returned by sm.get_tickers()
# Format: TICKER → Full company name
ALL_BVC_TICKERS: dict[str, str] = {
    "ADH": "Douja Promotion Groupe Addoha",
    "ADI": "Alliances Developpement Immobilier S.A.",
    "AFI": "Afric Industries S.A.",
    "AFM": "AFMA S.A.",
    "AGM": "Agma S.A.",
    "ALM": "Aluminium du Maroc",
    "ARD": "Aradei Capital",
    "ATH": "Auto Hall S.A.",
    "ATL": "AtlantaSanad",
    "ATW": "Attijariwafa Bank",
    "BAL": "Societe Immobiliere Balima",
    "BCI": "Banque Marocaine pour le Commerce et l'Industrie",
    "BCP": "Banque Centrale Populaire S.A.",
    "BOA": "Bank of Africa",
    "CDA": "Centrale Danone",
    "CDM": "Credit du Maroc",
    "CIH": "Credit Immobilier et Hotelier",
    "CMA": "Les Ciments du Maroc",
    "CMT": "Compagnie Miniere de Touissit S.A.",
    "COL": "Colorado S.A.",
    "CRS": "Cartier Saada S.A.",
    "CSR": "Cosumar",
    "CTM": "Compagnie de Transports au Maroc S.A.",
    "DHO": "Delta Holding S.A.",
    "DLM": "Delattre Levivier Maroc S.A.",
    "DWY": "Disway S.A.",
    "EQD": "Societe d'Equipement Domestique et Menager S.A.",
    "FBR": "Fenie Brossette S.A.",
    "GAZ": "Afriquia Gaz",
    "HPS": "Hightech Payment Systems S.A.",
    "IAM": "Maroc Telecom",
    "IBC": "IB Maroc.com S.A.",
    "IMO": "Immorente Invest S.A.",
    "INV": "Involys",
    "JET": "Jet Contractors S.A.",
    "LBV": "Label Vie",
    "LES": "Lesieur Cristal S.A.",
    "LHM": "LafargeHolcim Maroc",
    "M2M": "m2m group S.A.",
    "MAB": "Maghrebail",
    "MDP": "Med Paper S.A.",
    "MIC": "Microdata S.A.R.L.",
    "MLE": "Maroc Leasing S.A.",
    "MNG": "Managem",
    "MOX": "Maghreb Oxygene",
    "MSA": "SODEP-Marsa Maroc",
    "MUT": "Mutandis SCA",
    "NEJ": "Auto Nejma Maroc S.A.",
    "NKL": "Ennakl Automobiles",
    "PRO": "Promopharm S.A.",
    "RDS": "Residences Dar Saada S.A.",
    "RIS": "Risma",
    "S2M": "Societe Maghrebine de Monetique",
    "SAH": "Saham Assurance S.A.",
    "SBM": "Societe des Boissons du Maroc",
    "SID": "Societe Nationale de Siderurgie S.A.",
    "SLF": "Salafin",
    "SMI": "Societe Metallurgique d'Imiter",
    "SNA": "Stokvis Nord Afrique",
    "SNP": "Societe Nationale d'Electrolyse et de Petrochimie",
    "SOT": "Sothema",
    "SRM": "Societe de Realisations Mecaniques",
    "STR": "STROC Industrie S.A.",
    "TGC": "Travaux Generaux de Construction de Casablanca S.A.",
    "TIM": "TIMAR S.A.",
    "TMA": "TotalEnergies Marketing Maroc",
    "TQM": "Taqa Morocco",
    "WAA": "Wafa Assurance S.A.",
    "ZDJ": "Zellidja S.A.",
}

# Leboursier full name → 3-letter ticker (for parsing StocksMA responses
# that return the company name rather than the ticker code)
NAME_TO_TICKER: dict[str, str] = {
    name.upper(): ticker for ticker, name in ALL_BVC_TICKERS.items()
}

# Additional name variants seen in StocksMA / Leboursier responses
NAME_ALIASES: dict[str, str] = {
    "ATTIJARIWAFA BANK": "ATW",
    "ATTIJARIWAFA": "ATW",
    "BANQUE CENTRALE POPULAIRE": "BCP",
    "MAROC TELECOM": "IAM",
    "ITISSALAT AL-MAGHRIB": "IAM",
    "ITISSALAT AL MAGHRIB": "IAM",
    "LAFARGEHOLCIM MAROC": "LHM",
    "LAFARGE HOLCIM MAROC": "LHM",
    "TAQA MOROCCO": "TQM",
    "COSUMAR SA": "CSR",
    "WAFA ASSURANCE": "WAA",
    "ADDOHA": "ADH",
    "CIH BANK": "CIH",
    "LABEL VIE": "LBV",
    "CREDIT DU MAROC": "CDM",
    "BANQUE MAROCAINE POUR LE COMMERCE": "BCI",
    "BMCI": "BCI",
    "LESIEUR CRISTAL": "LES",
    "DELTA HOLDING": "DHO",
    "BANK OF AFRICA": "BOA",
    "SAHAM ASSURANCE": "SAH",
    "AUTO NEJMA": "NEJ",
    "AUTO HALL": "ATH",
    "SONASID": "SID",
    "ATLANTASANAD": "ATL",
    "ALLIANCES": "ADI",
    "AFRIQUIA GAZ": "GAZ",
    "JET CONTRACTORS": "JET",
    "MARSA MAROC": "MSA",
    "SODEP MARSA MAROC": "MSA",
    "MANAGEM": "MNG",
    "HIGHTECH PAYMENT SYSTEMS": "HPS",
    "RISMA": "RIS",
    "DISWAY": "DWY",
    "CENTRALE DANONE": "CDA",
    "CIMENTS DU MAROC": "CMA",
    "LES CIMENTS DU MAROC": "CMA",
    "ARADEI CAPITAL": "ARD",
    "MUTANDIS": "MUT",
    "TOTALENERGIES MARKETING MAROC": "TMA",
    "TOTAL MAROC": "TMA",
    "SOTHEMA": "SOT",
    "PROMOPHARM": "PRO",
    "COLORADO": "COL",
    "ALUMINIUM DU MAROC": "ALM",
    "MAGHREB OXYGENE": "MOX",
    "SALAFIN": "SLF",
    "MAGHREBAIL": "MAB",
    "MAROC LEASING": "MLE",
    "AGMA": "AGM",
    "AFRIC INDUSTRIES": "AFI",
    "AFMA": "AFM",
    "IB MAROC": "IBC",
    "IMMORENTE INVEST": "IMO",
    "INVOLYS": "INV",
    "M2M GROUP": "M2M",
    "MED PAPER": "MDP",
    "MICRODATA": "MIC",
    "CARTIER SAADA": "CRS",
    "SOCIETE DES BOISSONS DU MAROC": "SBM",
    "SMI": "SMI",
    "STOKVIS NORD AFRIQUE": "SNA",
    "STROC INDUSTRIE": "STR",
    "TGCC": "TGC",
    "TRAVAUX GENERAUX DE CONSTRUCTION": "TGC",
    "TIMAR": "TIM",
    "ZELLIDJA": "ZDJ",
    "DELATTRE LEVIVIER MAROC": "DLM",
    "BALIMA": "BAL",
    "COMPAGNIE MINIERE DE TOUISSIT": "CMT",
    "CTM": "CTM",
    "FENIE BROSSETTE": "FBR",
    "S2M": "S2M",
    "RESIDENCES DAR SAADA": "RDS",
    "ENNAKL AUTOMOBILES": "NKL",
    "SOCIETE METALLURGIQUE D IMITER": "SMI",
    "CREDIT IMMOBILIER ET HOTELIER": "CIH",
    "SOCIETE NATIONALE DE SIDERURGIE": "SID",
}


def normalize_ticker(raw: str) -> str:
    """
    Convert any StocksMA identifier (ticker or full name) to
    the canonical 3-letter BVC ticker.

    Examples:
        normalize_ticker("ATW")                   → "ATW"
        normalize_ticker("CSEMA:ATW")             → "ATW"
        normalize_ticker("Attijariwafa Bank")      → "ATW"
        normalize_ticker("MAROC TELECOM")          → "IAM"
    """
    clean = raw.strip().upper().replace("CSEMA:", "")

    # Direct match (already a ticker)
    if clean in ALL_BVC_TICKERS:
        return clean

    # Full-name lookup
    if clean in NAME_TO_TICKER:
        return NAME_TO_TICKER[clean]

    # Alias lookup
    if clean in NAME_ALIASES:
        return NAME_ALIASES[clean]

    # Partial match — check if any known name starts with the input
    for name, ticker in NAME_TO_TICKER.items():
        if name.startswith(clean[:6]):
            return ticker

    # Give up — return cleaned input as-is
    return clean


def is_valid_bvc_ticker(ticker: str) -> bool:
    """Return True if ticker is a known BVC symbol."""
    return normalize_ticker(ticker) in ALL_BVC_TICKERS


def get_company_name(ticker: str) -> str:
    """Return the full company name for a ticker, or the ticker itself."""
    t = normalize_ticker(ticker)
    return ALL_BVC_TICKERS.get(t, t)
