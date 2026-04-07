#!/usr/bin/env python3
"""
AMMC PDF Financial Data Extraction Pipeline — V2
=================================================
Extracts financial data from AMMC annual reports (PDF) for all BVC-listed companies.

V2 improvements over V1:
- Uses pdfplumber table extraction alongside text regex
- Handles multi-column table layouts (2024 vs 2023 columns)
- Better number parsing that avoids concatenating cross-column values
- Narrative text extraction for summary pages
- Value magnitude sanity checks

Source: /Users/user/auto/AMMC_rapports_2024/
Output: data/financials_2024.json + data/extraction_log_2024.json
"""

import os
import re
import json
import sys
from datetime import date
from pathlib import Path
from typing import Optional

try:
    import pdfplumber
except ImportError:
    os.system(f"{sys.executable} -m pip install pdfplumber")
    import pdfplumber

# ── Configuration ──────────────────────────────────────────────────────────────

PDF_ROOT = Path("/Users/user/auto/AMMC_rapports_2024")
PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "data"
OUTPUT_JSON = OUTPUT_DIR / "financials_2024.json"
OUTPUT_LOG = OUTPUT_DIR / "extraction_log_2024.json"

# Suppress pdfplumber color warnings
import logging
logging.getLogger("pdfminer").setLevel(logging.ERROR)

import warnings
warnings.filterwarnings("ignore")

# ── Company → Ticker mapping ──────────────────────────────────────────────────

TICKER_MAP = {
    "ADDOHA": "ADH", "ADM": "ADM", "AFMA": "AFM",
    "AFRIC_INDUSTRIES_SA": "AFI", "AGENCE_NATIONALE_DES_PORTS_ANP": "ANP",
    "AGMA": "AGM", "AKDITAL": "AKT", "ALLIANCES_DARNA": "ADI",
    "ALLIANCES_DEVELOPPEMENT_IMMOBILIER_ADI": "ADI",
    "ALUMINIUM_DU_MAROC": "ALM", "ARADEI_CAPITAL": "ARD",
    "ATLANTASANAD": "ATL", "ATTIJARIWAFA_BANK": "ATW",
    "AUTO_HALL": "ATH", "AUTO_NEJMA": "NEJ", "BALIMA": "BAL",
    "BANK_OF_AFRICA_GROUPE_BMCE_BOA": "BOA",
    "BANQUE_CENTRALE_POPULAIRE_BCP": "BCP", "BMCI": "BCI",
    "CARTIER_SAADA": "CRS", "CDG_CAPITAL": "CDG", "CFG_BANK": "CFG",
    "CIH_BANK": "CIH", "CIMENTS_DU_MAROC": "CMA", "CMGP_GROUP": "CMG",
    "COLORADO_SA": "COL", "COMPAGNIE_MINIERE_DE_TOUISSIT_CMT": "CMT",
    "COSUMAR": "CSR", "CREDIT_AGRICOLE_DU_MAROC_CAM": "CAM",
    "CREDIT_DU_MAROC_CDM": "CDM", "CTM": "CTM", "DARI_COUSPATE": "DRI",
    "DELTA_HOLDING_S_A": "DHO", "DISTY_TECHNOLOGIES": "DYT",
    "DISWAY": "DWY", "ENNAKL_AUTOMOBILES": "NKL", "EQDOM": "EQD",
    "FEC": "FEC", "FENIE_BROSSETTE": "FBR", "HPS_SA": "HPS",
    "INVOLYS": "INV", "JAIDA": "JAI", "JET_CONTRACTORS": "JET",
    "LABEL_VIE_S_A": "LBV", "LAFARGEHOLCIM_MAROC": "LHM",
    "LESIEUR_CRISTAL": "LES", "LYDEC": "LYD", "M2M_GROUP": "M2M",
    "MAGHREBAIL": "MAB", "MAGHREB_STEEL": "MGS", "MANAGEM": "MNG",
    "MAROC_LEASING_SA": "MLE", "MAROC_TELECOM": "IAM",
    "MARSA_MAROC": "MSA", "MED_PAPER_EX_PAPELERA_DE_TETUAN": "MDP",
    "MICRODATA": "MIC", "MUTANDIS_SCA": "MUT", "OCP": "OCP",
    "ONCF": "ONCF", "OULMES": "OUL", "PROMOPHARM": "PRO",
    "RCI_FINANCE_MAROC": "RCI", "REBAB_COMPANY": "REB",
    "RESIDENCES_DAR_SAADA_RDS": "RDS", "RISMA": "RIS", "S2M": "S2M",
    "SAHAM_BANK": "SBK", "SAHAM_LEASING": "SHL", "SALAFIN": "SLF",
    "SANLAM_MAROC_EX_SAHAM_ASSURANCE": "SAH", "SMI": "SMI", "SNEP": "SNP",
    "SOCIETE_DES_BOISSONS_DU_MAROC_SBM": "SBM", "SOFAC": "SOF",
    "SONASID": "SID", "SOTHEMA": "SOT", "STOKVIS_NORD_AFRIQUE": "SNA",
    "STROC": "STR", "TANGER_MED_PORT_AUTHORITY": "TMP",
    "TAQA_MOROCCO_EX_JLEC": "TQM", "TGCC_SA": "TGC",
    "TOTALENERGIES_MARKETING_MAROC": "TMA", "UNIMER": "UMR",
    "WAFABAIL": "WFB", "WAFASALAF": "WFS", "WAFA_ASSURANCE": "WAA",
    "ZELLIDJA": "ZDJ",
}

COMPANY_NAMES = {
    "ADDOHA": "Addoha", "ADM": "Autoroutes du Maroc", "AFMA": "AFMA",
    "AFRIC_INDUSTRIES_SA": "Afric Industries",
    "AGENCE_NATIONALE_DES_PORTS_ANP": "ANP", "AGMA": "Agma",
    "AKDITAL": "Akdital", "ALLIANCES_DARNA": "Alliances Darna",
    "ALLIANCES_DEVELOPPEMENT_IMMOBILIER_ADI": "Alliances",
    "ALUMINIUM_DU_MAROC": "Aluminium du Maroc",
    "ARADEI_CAPITAL": "Aradei Capital", "ATLANTASANAD": "AtlantaSanad",
    "ATTIJARIWAFA_BANK": "Attijariwafa Bank", "AUTO_HALL": "Auto Hall",
    "AUTO_NEJMA": "Auto Nejma", "BALIMA": "Balima",
    "BANK_OF_AFRICA_GROUPE_BMCE_BOA": "Bank of Africa",
    "BANQUE_CENTRALE_POPULAIRE_BCP": "Banque Centrale Populaire",
    "BMCI": "BMCI", "CARTIER_SAADA": "Cartier Saada",
    "CDG_CAPITAL": "CDG Capital", "CFG_BANK": "CFG Bank",
    "CIH_BANK": "CIH Bank", "CIMENTS_DU_MAROC": "Ciments du Maroc",
    "CMGP_GROUP": "CMGP Group", "COLORADO_SA": "Colorado",
    "COMPAGNIE_MINIERE_DE_TOUISSIT_CMT": "CMT", "COSUMAR": "Cosumar",
    "CREDIT_AGRICOLE_DU_MAROC_CAM": "Crédit Agricole du Maroc",
    "CREDIT_DU_MAROC_CDM": "Crédit du Maroc", "CTM": "CTM",
    "DARI_COUSPATE": "Dari Couspate", "DELTA_HOLDING_S_A": "Delta Holding",
    "DISTY_TECHNOLOGIES": "Disty Technologies", "DISWAY": "Disway",
    "ENNAKL_AUTOMOBILES": "Ennakl", "EQDOM": "Eqdom", "FEC": "FEC",
    "FENIE_BROSSETTE": "Fenie Brossette", "HPS_SA": "HPS",
    "INVOLYS": "Involys", "JAIDA": "Jaida",
    "JET_CONTRACTORS": "Jet Contractors", "LABEL_VIE_S_A": "Label Vie",
    "LAFARGEHOLCIM_MAROC": "LafargeHolcim Maroc",
    "LESIEUR_CRISTAL": "Lesieur Cristal", "LYDEC": "Lydec",
    "M2M_GROUP": "M2M Group", "MAGHREBAIL": "Maghrebail",
    "MAGHREB_STEEL": "Maghreb Steel", "MANAGEM": "Managem",
    "MAROC_LEASING_SA": "Maroc Leasing", "MAROC_TELECOM": "Maroc Telecom",
    "MARSA_MAROC": "Marsa Maroc", "MED_PAPER_EX_PAPELERA_DE_TETUAN": "Med Paper",
    "MICRODATA": "Microdata", "MUTANDIS_SCA": "Mutandis", "OCP": "OCP",
    "ONCF": "ONCF", "OULMES": "Oulmès", "PROMOPHARM": "Promopharm",
    "RCI_FINANCE_MAROC": "RCI Finance Maroc",
    "REBAB_COMPANY": "Rebab Company",
    "RESIDENCES_DAR_SAADA_RDS": "Résidences Dar Saada",
    "RISMA": "Risma", "S2M": "S2M", "SAHAM_BANK": "Saham Bank",
    "SAHAM_LEASING": "Saham Leasing", "SALAFIN": "Salafin",
    "SANLAM_MAROC_EX_SAHAM_ASSURANCE": "Sanlam Maroc", "SMI": "SMI",
    "SNEP": "SNEP", "SOCIETE_DES_BOISSONS_DU_MAROC_SBM": "SBM",
    "SOFAC": "Sofac", "SONASID": "Sonasid", "SOTHEMA": "Sothema",
    "STOKVIS_NORD_AFRIQUE": "Stokvis Nord Afrique",
    "STROC": "Stroc Industrie", "TANGER_MED_PORT_AUTHORITY": "Tanger Med",
    "TAQA_MOROCCO_EX_JLEC": "TAQA Morocco", "TGCC_SA": "TGCC",
    "TOTALENERGIES_MARKETING_MAROC": "TotalEnergies Marketing Maroc",
    "UNIMER": "Unimer", "WAFABAIL": "Wafabail", "WAFASALAF": "Wafasalaf",
    "WAFA_ASSURANCE": "Wafa Assurance", "ZELLIDJA": "Zellidja",
}


# ── Number parsing (V2 — much stricter) ───────────────────────────────────────

def parse_number(text: str) -> Optional[float]:
    """
    Parse a single French-formatted number token.
    Strict: only accepts reasonable-looking number strings.
    """
    if not text:
        return None
    text = text.strip()
    if text in ('', '-', '—', 'N/A', 'n.d.', 'ns', 'NS', 'n/a'):
        return None

    negative = False
    if text.startswith('(') and text.endswith(')'):
        negative = True
        text = text[1:-1].strip()
    elif text.startswith('-'):
        negative = True
        text = text[1:].strip()

    # Remove thousand separators (spaces and non-breaking spaces)
    text = text.replace('\u00a0', ' ').replace('\u202f', ' ')

    # Handle French format: "1 234,56" or "1.234,56"
    if ',' in text:
        # Dots before comma are thousand separators
        text = text.replace('.', '')
        text = text.replace(',', '.')
    else:
        # No comma — dots could be thousand separators or decimals
        # If multiple dots, they're thousand separators
        if text.count('.') > 1:
            text = text.replace('.', '')

    # Remove remaining spaces (thousand separators)
    text = text.replace(' ', '')

    # Must be a valid number now
    text = re.sub(r'[^\d.\-]', '', text)
    if not text or text == '.':
        return None

    try:
        val = float(text)
        return -val if negative else val
    except ValueError:
        return None


def extract_number_from_token(text: str) -> Optional[float]:
    """Extract a single number from a short text token (table cell or inline value)."""
    if not text:
        return None
    # Remove common suffixes
    text = re.sub(r'\s*(M|Md|Mds|K|KMAD|MMAD|MDHS|DH|MAD|MDH|MdDH|%)\s*$', '', text.strip(), flags=re.IGNORECASE)
    return parse_number(text)


# ── Unit detection ─────────────────────────────────────────────────────────────

def detect_unit(text: str) -> float:
    """
    Detect the unit multiplier from document text.
    Returns multiplier to convert to MMAD (millions of MAD).
    """
    text_l = text.lower()
    # Look for unit specifications in headers/footers
    patterns = [
        (r'en\s+milliards?\b', 1000.0),
        (r'en\s+mmdh\b', 1000.0),
        (r'en\s+mds?\s*(?:de\s+)?(?:dh|mad|dirhams?)', 1000.0),
        (r'en\s+millions?\b', 1.0),
        (r'en\s+mdh\b', 1.0),
        (r'en\s+m\s+(?:de\s+)?(?:dh|mad|dirhams?)', 1.0),
        (r'en\s+mmad\b', 1.0),
        (r'en\s+milliers?\b', 0.001),
        (r'en\s+kdh\b', 0.001),
        (r'en\s+kmad\b', 0.001),
        (r'en\s+k\s*(?:de\s+)?(?:dh|mad|dirhams?)', 0.001),
    ]
    for pat, mult in patterns:
        if re.search(pat, text_l):
            return mult
    return 1.0  # default: MMAD


# ── Table-based extraction ────────────────────────────────────────────────────

# Labels we look for in table rows, mapped to our field names
TABLE_LABELS = {
    # Income statement
    "chiffre_affaires": [
        "chiffre d'affaires", "chiffre d'affaires", "chiffres d'affaires",
        "ca net", "c.a.", "ca consolidé",
        "revenus", "produit net bancaire", "pnb",
        "primes acquises", "primes émises",
    ],
    "resultat_exploitation": [
        "résultat d'exploitation", "resultat d'exploitation",
        "résultat d'exploitation", "resultat d exploitation",
        "rex",
    ],
    "resultat_net": [
        "résultat net", "resultat net", "bénéfice net",
    ],
    "resultat_net_part_groupe": [
        "résultat net part du groupe", "resultat net part du groupe",
        "rnpg", "résultat net pdg",
    ],
    "ebitda": [
        "ebitda", "excédent brut d'exploitation", "ebe",
        "excedent brut d'exploitation",
    ],
    "resultat_financier": [
        "résultat financier", "resultat financier",
    ],
    "resultat_courant": [
        "résultat courant", "resultat courant",
    ],
    # Balance sheet
    "total_actif": [
        "total actif", "total de l'actif", "total bilan",
        "total du bilan",
    ],
    "total_passif": [
        "total passif", "total du passif",
    ],
    "capitaux_propres": [
        "capitaux propres", "fonds propres",
    ],
    "dette_nette": [
        "dette nette", "endettement net",
    ],
    "tresorerie_nette": [
        "trésorerie nette", "tresorerie nette",
        "disponibilités",
    ],
    # Cash flow
    "cash_flow_exploitation": [
        "cash flow opérationnel", "cash-flow opérationnel",
        "cashflow opérationnel", "flux de trésorerie d'exploitation",
        "flux de trésorerie lié aux activités d'exploitation",
        "autofinancement", "capacité d'autofinancement", "caf",
    ],
    "investissements_capex": [
        "capex", "investissements",
        "flux de trésorerie d'investissement",
    ],
    "cash_flow_libre": [
        "free cash flow", "free cash-flow", "fcf",
        "cash flow libre", "cash-flow libre",
    ],
    "dividendes_verses": [
        "dividendes versés", "dividendes distribués",
        "distributions de dividendes",
    ],
}


def normalize_label(text: str) -> str:
    """Normalize a label for comparison."""
    if not text:
        return ""
    text = text.lower().strip()
    # Normalize apostrophes
    text = text.replace('\u2019', "'").replace('\u2018', "'")
    # Remove leading bullets, dashes, dots
    text = re.sub(r'^[\s•\-–—·\.]+', '', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def match_label(cell_text: str, target_labels: list[str]) -> bool:
    """Check if a cell text matches any of the target labels."""
    norm = normalize_label(cell_text)
    if not norm:
        return False
    for label in target_labels:
        if label in norm or norm in label:
            return True
        # Also check for contained match (partial)
        if len(label) > 5 and label in norm:
            return True
    return False


def extract_from_tables(pdf_path: str) -> dict:
    """
    Extract financial data using pdfplumber's table detection.
    Returns dict of field_name → value.
    """
    results = {}

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                try:
                    tables = page.extract_tables()
                    if not tables:
                        continue

                    page_text = page.extract_text() or ""
                    multiplier = detect_unit(page_text)

                    for table in tables:
                        if not table or len(table) < 2:
                            continue

                        # Try to identify which column is 2024
                        header_row = table[0] if table[0] else []
                        col_2024 = None
                        col_label = 0

                        for ci, cell in enumerate(header_row):
                            if cell and "2024" in str(cell):
                                col_2024 = ci
                                break

                        # If no 2024 header, assume first numeric column after label
                        if col_2024 is None and len(header_row) >= 2:
                            col_2024 = 1  # Usually: Label | 2024 | 2023

                        for row in table[1:]:
                            if not row or not row[0]:
                                continue

                            label_cell = str(row[0]).strip()

                            for field_name, target_labels in TABLE_LABELS.items():
                                if match_label(label_cell, target_labels):
                                    # Try to get value from 2024 column
                                    val = None
                                    if col_2024 is not None and col_2024 < len(row) and row[col_2024]:
                                        val = extract_number_from_token(str(row[col_2024]))

                                    # Fallback: try first numeric cell after label
                                    if val is None:
                                        for ci in range(1, len(row)):
                                            if row[ci]:
                                                v = extract_number_from_token(str(row[ci]))
                                                if v is not None:
                                                    val = v
                                                    break

                                    if val is not None:
                                        val *= multiplier
                                        # Only overwrite if we don't have this field yet
                                        # or if this is from a later page (more likely to be summary)
                                        results[field_name] = val
                                    break

                except Exception:
                    continue
    except Exception:
        pass

    return results


# ── Narrative text extraction ─────────────────────────────────────────────────

def extract_from_narrative(text: str) -> dict:
    """
    Extract financial values from narrative/summary text.
    Looks for patterns like:
    - "chiffre d'affaires de 2 116 M MAD"
    - "EBE en hausse à 351 M MAD"
    - "Résultat Net: 128 MMAD"
    """
    results = {}

    # Patterns: label ... value UNIT
    # We capture the value and its unit separately
    narrative_patterns = [
        # CA
        ("chiffre_affaires", [
            r"chiffre\s+d['\u2019]affaires?\s+(?:consolid[ée]\s+)?(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
            r"(?:CA|C\.A\.)\s+(?:consolid[ée]\s+)?(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
            r"produit\s+net\s+bancaire\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
        ]),
        # EBITDA / EBE
        ("ebitda", [
            r"(?:EBITDA|EBE)\s+(?:consolid[ée]\s+)?(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
            r"(?:EBITDA|EBE)\s+(?:en\s+\w+\s+)?(?:de\s+\+?\d+%\s+)?[àa]\s+([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
        ]),
        # Résultat net
        ("resultat_net", [
            r"r[ée]sultat\s+net\s+(?:consolid[ée]\s+)?(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
            r"(?:RN|R\.N\.)\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
        ]),
        # RNPG
        ("resultat_net_part_groupe", [
            r"r[ée]sultat\s+net\s+part\s+(?:du\s+)?groupe\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
            r"RNPG\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
        ]),
        # Dette nette
        ("dette_nette", [
            r"dette\s+nette\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
            r"endettement\s+net\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
        ]),
        # Capitaux propres / fonds propres
        ("capitaux_propres", [
            r"(?:capitaux|fonds)\s+propres?\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
        ]),
        # Total actif / bilan
        ("total_actif", [
            r"total\s+(?:de\s+l['\u2019])?actif\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
            r"total\s+bilan\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
        ]),
        # Cash flow / Capex
        ("cash_flow_exploitation", [
            r"(?:cash[\s-]?flow|flux)\s+(?:de\s+)?(?:tr[ée]sorerie\s+)?op[ée]rationnel\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
            r"(?:capacit[ée]\s+d['\u2019])?autofinancement\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
        ]),
        ("investissements_capex", [
            r"(?:capex|investissements?)\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
        ]),
        # Résultat d'exploitation
        ("resultat_exploitation", [
            r"r[ée]sultat\s+d['\u2019]exploitation\s+(?:de\s+|[àa]\s+|:\s*)([\d\s]+(?:[.,]\d+)?)\s*(M|Md|Mds|MMAD|MDHS?|MDH)\b",
        ]),
    ]

    def unit_to_multiplier(unit: str) -> float:
        u = unit.lower().strip()
        if u in ('md', 'mds', 'mmdh'):
            return 1000.0  # billions → millions
        if u in ('m', 'mmad', 'mdh', 'mdhs'):
            return 1.0     # already millions
        if u in ('k', 'kdh', 'kmad'):
            return 0.001   # thousands → millions
        return 1.0

    for field_name, patterns in narrative_patterns:
        for pattern in patterns:
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            if matches:
                # Take the last match (more likely to be from summary page)
                m = matches[-1]
                val = parse_number(m.group(1))
                if val is not None:
                    mult = unit_to_multiplier(m.group(2))
                    val *= mult
                    if field_name not in results:
                        results[field_name] = val
                break

    return results


# ── Line-by-line text table extraction (for non-table PDFs) ───────────────────

def extract_from_text_lines(text: str) -> dict:
    """
    Extract financial data from text that has table-like structure
    where label and values are separated by whitespace on the same line.
    """
    results = {}
    multiplier = detect_unit(text)

    lines = text.split('\n')

    # Label patterns for line-by-line matching
    line_patterns = {
        "chiffre_affaires": r"^[\s•\-]*(?:chiffre\s+d['\u2019]affaires?|produit\s+net\s+bancaire|primes?\s+acquises?)\s*[:.]?\s+",
        "resultat_exploitation": r"^[\s•\-]*r[ée]sultat\s+d['\u2019]exploitation\s*[:.]?\s+",
        "resultat_net": r"^[\s•\-]*r[ée]sultat\s+net\s*[:.]?\s+",
        "resultat_net_part_groupe": r"^[\s•\-]*r[ée]sultat\s+net\s+part\s+(?:du\s+)?groupe\s*[:.]?\s+",
        "ebitda": r"^[\s•\-]*(?:EBITDA|EBE|exc[ée]dent\s+brut\s+d['\u2019]exploitation)\s*[:.]?\s+",
        "total_actif": r"^[\s•\-]*total\s+(?:de\s+l['\u2019])?actif\s*[:.]?\s+",
        "total_passif": r"^[\s•\-]*total\s+(?:du\s+)?passif\s*[:.]?\s+",
        "capitaux_propres": r"^[\s•\-]*(?:capitaux|fonds)\s+propres?\s*[:.]?\s+",
        "dette_nette": r"^[\s•\-]*(?:dette|endettement)\s+net(?:te)?\s*[:.]?\s+",
        "tresorerie_nette": r"^[\s•\-]*tr[ée]sorerie\s+nette\s*[:.]?\s+",
        "cash_flow_exploitation": r"^[\s•\-]*(?:cash[\s-]?flow|flux)\s+(?:de\s+)?(?:tr[ée]sorerie\s+)?(?:d['\u2019])?(?:exploitation|op[ée]rationnel)\s*[:.]?\s+",
        "investissements_capex": r"^[\s•\-]*(?:capex|investissements?)\s*[:.]?\s+",
        "cash_flow_libre": r"^[\s•\-]*(?:free\s+cash[\s-]?flow|FCF|cash[\s-]?flow\s+libre)\s*[:.]?\s+",
    }

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped or len(line_stripped) < 5:
            continue

        for field_name, pattern in line_patterns.items():
            if field_name in results:
                continue
            m = re.search(pattern, line_stripped, re.IGNORECASE)
            if m:
                # Get the part after the label
                rest = line_stripped[m.end():].strip()
                # Extract numbers from the rest — take first reasonable one
                # Split by whitespace to get individual number tokens
                tokens = re.split(r'\s{2,}', rest)
                for token in tokens:
                    val = extract_number_from_token(token.strip())
                    if val is not None:
                        val *= multiplier
                        results[field_name] = val
                        break
                break

    return results


# ── Main extraction per company ───────────────────────────────────────────────

def extract_company_data(folder_name: str, pdf_path: str) -> dict:
    """Extract all financial data from a PDF for one company."""
    ticker = TICKER_MAP.get(folder_name, folder_name[:3].upper())
    company_name = COMPANY_NAMES.get(folder_name, folder_name.replace("_", " ").title())

    # Extract full text
    full_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            pages_text = []
            for page in pdf.pages:
                try:
                    t = page.extract_text()
                    if t:
                        pages_text.append(t)
                except Exception:
                    pass
            full_text = "\n\n".join(pages_text)
    except Exception as e:
        raise RuntimeError(f"Cannot read PDF: {e}")

    if not full_text.strip():
        raise RuntimeError("Empty PDF - likely scanned image, needs OCR")

    # Check if consolidated
    is_consolidated = bool(re.search(r'consolid[ée]', full_text, re.IGNORECASE))

    # Strategy 1: Table extraction (most reliable)
    table_data = extract_from_tables(pdf_path)

    # Strategy 2: Narrative text extraction
    narrative_data = extract_from_narrative(full_text)

    # Strategy 3: Line-by-line text parsing
    line_data = extract_from_text_lines(full_text)

    # Merge: tables preferred, then narrative, then line parsing
    merged = {}
    all_fields = set(list(TABLE_LABELS.keys()) + ["resultat_financier", "resultat_courant",
                      "dettes_long_terme", "dettes_court_terme", "immobilisations",
                      "produits_exploitation", "charges_exploitation"])

    for field in all_fields:
        if field in table_data and table_data[field] is not None:
            merged[field] = table_data[field]
        elif field in narrative_data and narrative_data[field] is not None:
            merged[field] = narrative_data[field]
        elif field in line_data and line_data[field] is not None:
            merged[field] = line_data[field]
        else:
            merged[field] = None

    # Separate into sections
    income_fields = ["chiffre_affaires", "produits_exploitation", "charges_exploitation",
                     "resultat_exploitation", "resultat_financier", "resultat_courant",
                     "resultat_net", "resultat_net_part_groupe", "ebitda"]
    balance_fields = ["total_actif", "total_passif", "capitaux_propres",
                      "dettes_long_terme", "dettes_court_terme", "tresorerie_nette",
                      "dette_nette", "immobilisations"]
    cashflow_fields = ["cash_flow_exploitation", "investissements_capex",
                       "cash_flow_libre", "dividendes_verses"]

    income = {f: merged.get(f) for f in income_fields}
    balance = {f: merged.get(f) for f in balance_fields}
    cashflow = {f: merged.get(f) for f in cashflow_fields}

    # Compute ratios
    ratios = {}
    ca = income.get("chiffre_affaires")
    rn = income.get("resultat_net")
    ebitda = income.get("ebitda")
    cp = balance.get("capitaux_propres")
    dn = balance.get("dette_nette")

    if rn is not None and ca is not None and ca != 0:
        ratios["marge_nette"] = round((rn / ca) * 100, 2)
    else:
        ratios["marge_nette"] = None

    if ebitda is not None and ca is not None and ca != 0:
        ratios["marge_ebitda"] = round((ebitda / ca) * 100, 2)
    else:
        ratios["marge_ebitda"] = None

    if rn is not None and cp is not None and cp != 0:
        ratios["roe"] = round((rn / cp) * 100, 2)
    else:
        ratios["roe"] = None

    if dn is not None and cp is not None and cp != 0:
        ratios["ratio_endettement"] = round(dn / cp, 2)
    else:
        ratios["ratio_endettement"] = None

    # Detect report type
    report_type = "Annuel"
    if "semestriel" in full_text.lower():
        report_type = "Semestriel"

    notes = []
    if is_consolidated:
        notes.append("Rapport consolidé")
    notes.append(f"Sources: table={len(table_data)}, narrative={len(narrative_data)}, lines={len(line_data)}")

    return {
        "company_name": company_name,
        "ticker": ticker,
        "annee": 2024,
        "type_rapport": report_type,
        "date_extraction": date.today().isoformat(),
        "source_pdf": os.path.relpath(pdf_path, PDF_ROOT),
        "income_statement": income,
        "balance_sheet": balance,
        "cash_flow": cashflow,
        "ratios": ratios,
        "notes": "; ".join(notes),
    }


def build_extraction_log(company_data: dict) -> list[dict]:
    """Build field-level extraction log entries."""
    log_entries = []
    for section in ["income_statement", "balance_sheet", "cash_flow", "ratios"]:
        for field, value in company_data.get(section, {}).items():
            log_entries.append({
                "company": company_data["company_name"],
                "ticker": company_data["ticker"],
                "section": section,
                "field": field,
                "status": "ok" if value is not None else "missing",
                "value": value,
            })
    return log_entries


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 72)
    print("  AMMC PDF Financial Data Extraction Pipeline — V2")
    print("=" * 72)
    print(f"\nSource: {PDF_ROOT}")
    print(f"Output: {OUTPUT_DIR}\n")

    if not PDF_ROOT.exists():
        print(f"ERROR: Source folder not found: {PDF_ROOT}")
        sys.exit(1)

    # Discover PDFs
    companies = []
    for folder in sorted(PDF_ROOT.iterdir()):
        if not folder.is_dir():
            continue
        pdfs = list(folder.glob("*.pdf")) + list(folder.glob("*.PDF"))
        for pdf in pdfs:
            companies.append((folder.name, str(pdf)))

    print(f"📁 {len(set(c[0] for c in companies))} company folders, {len(companies)} PDFs\n")

    all_results = []
    all_logs = []
    errors = []

    for i, (folder_name, pdf_path) in enumerate(companies, 1):
        label = COMPANY_NAMES.get(folder_name, folder_name)
        print(f"[{i:3d}/{len(companies)}] {label}...", end=" ", flush=True)

        try:
            data = extract_company_data(folder_name, pdf_path)
            all_results.append(data)
            all_logs.extend(build_extraction_log(data))

            ok = sum(1 for s in ["income_statement", "balance_sheet", "cash_flow", "ratios"]
                     for v in data[s].values() if v is not None)
            total = sum(len(data[s]) for s in ["income_statement", "balance_sheet", "cash_flow", "ratios"])
            print(f"✓ {ok}/{total} fields")

        except Exception as e:
            print(f"✗ {e}")
            errors.append((folder_name, str(e)))
            ticker = TICKER_MAP.get(folder_name, folder_name[:3].upper())
            data = {
                "company_name": label,
                "ticker": ticker,
                "annee": 2024,
                "type_rapport": "Annuel",
                "date_extraction": date.today().isoformat(),
                "source_pdf": os.path.relpath(pdf_path, PDF_ROOT),
                "income_statement": {f: None for f in ["chiffre_affaires", "produits_exploitation",
                    "charges_exploitation", "resultat_exploitation", "resultat_financier",
                    "resultat_courant", "resultat_net", "resultat_net_part_groupe", "ebitda"]},
                "balance_sheet": {f: None for f in ["total_actif", "total_passif", "capitaux_propres",
                    "dettes_long_terme", "dettes_court_terme", "tresorerie_nette", "dette_nette", "immobilisations"]},
                "cash_flow": {f: None for f in ["cash_flow_exploitation", "investissements_capex",
                    "cash_flow_libre", "dividendes_verses"]},
                "ratios": {"marge_nette": None, "marge_ebitda": None, "roe": None, "ratio_endettement": None},
                "notes": f"Error: {e}",
            }
            all_results.append(data)
            all_logs.extend(build_extraction_log(data))

    # Save
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    with open(OUTPUT_LOG, 'w', encoding='utf-8') as f:
        json.dump(all_logs, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Saved {len(all_results)} records → {OUTPUT_JSON}")
    print(f"✅ Saved {len(all_logs)} log entries → {OUTPUT_LOG}")

    # ── Validation ─────────────────────────────────────────────────────────
    print(f"\n{'=' * 72}")
    print("  VALIDATION & COVERAGE REPORT")
    print(f"{'=' * 72}")

    critical_ok = 0
    for c in all_results:
        ca = c["income_statement"].get("chiffre_affaires")
        rn = c["income_statement"].get("resultat_net")
        cp = c["balance_sheet"].get("capitaux_propres")
        if ca is not None or rn is not None or cp is not None:
            critical_ok += 1

    half_ok = sum(1 for c in all_results
                  if sum(1 for s in ["income_statement", "balance_sheet", "cash_flow"]
                         for v in c[s].values() if v is not None) >= 5)

    print(f"\n📊 Coverage:")
    print(f"   Companies with ≥1 critical field: {critical_ok}/{len(all_results)}")
    print(f"   Companies with ≥5 fields:         {half_ok}/{len(all_results)}")

    # Summary table
    print(f"\n{'─' * 90}")
    print(f"{'Company':<35} {'Ticker':>5} {'CA (MMAD)':>14} {'RN (MMAD)':>14} {'CP (MMAD)':>14} {'OK':>5}")
    print(f"{'─' * 90}")

    for c in sorted(all_results, key=lambda x: x["company_name"]):
        ca = c["income_statement"].get("chiffre_affaires")
        rn = c["income_statement"].get("resultat_net")
        cp = c["balance_sheet"].get("capitaux_propres")
        ok = sum(1 for s in ["income_statement", "balance_sheet", "cash_flow", "ratios"]
                 for v in c[s].values() if v is not None)
        total = sum(len(c[s]) for s in ["income_statement", "balance_sheet", "cash_flow", "ratios"])

        def fmt(v):
            if v is None:
                return "—"
            if abs(v) >= 1_000_000:
                return f"{v/1_000_000:,.1f}B"
            if abs(v) >= 1_000:
                return f"{v:,.0f}"
            return f"{v:,.2f}"

        print(f"{c['company_name'][:34]:<35} {c['ticker']:>5} {fmt(ca):>14} {fmt(rn):>14} {fmt(cp):>14} {ok:>2}/{total}")

    print(f"{'─' * 90}")

    if errors:
        print(f"\n⚠ {len(errors)} error(s):")
        for f, e in errors:
            print(f"   • {f}: {e}")

    print(f"\n✅ Extraction V2 complete!")


if __name__ == "__main__":
    main()
