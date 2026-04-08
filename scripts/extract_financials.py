#!/usr/bin/env python3
"""
AMMC PDF Financial Data Extraction Pipeline — V3
==================================================
Key fixes over V2:
  - Sanity bounds + auto-rescaling (raw MAD / KDH / MDH)
  - N-1 column extraction for YoY growth
  - Dividende par action from narrative
  - Proper CFO / CAPEX / CFF mapping
  - ESG basics (effectif, gender pct)
  - All output values in MDH (millions of MAD)

Source:  /Users/user/auto/AMMC_rapports_2024/
Outputs: data/financials_2024.json   — one object per company (values in MDH)
         data/extraction_log_2024.json
"""

import os, re, json, sys, warnings
from datetime import date
from pathlib import Path
from typing import Optional

try:
    import pdfplumber
except ImportError:
    os.system(f"{sys.executable} -m pip install pdfplumber")
    import pdfplumber

import logging
logging.getLogger("pdfminer").setLevel(logging.ERROR)
warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────────────────────
PDF_ROOT     = Path("/Users/user/auto/AMMC_rapports_2024")
PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR   = PROJECT_ROOT / "data"
OUTPUT_JSON  = OUTPUT_DIR / "financials_2024.json"
OUTPUT_LOG   = OUTPUT_DIR / "extraction_log_2024.json"

# ── Company maps ───────────────────────────────────────────────────────────────
TICKER_MAP = {
    "ADDOHA":"ADH","ADM":"ADM","AFMA":"AFM","AFRIC_INDUSTRIES_SA":"AFI",
    "AGENCE_NATIONALE_DES_PORTS_ANP":"ANP","AGMA":"AGM","AKDITAL":"AKT",
    "ALLIANCES_DARNA":"ADI","ALLIANCES_DEVELOPPEMENT_IMMOBILIER_ADI":"ADI",
    "ALUMINIUM_DU_MAROC":"ALM","ARADEI_CAPITAL":"ARD","ATLANTASANAD":"ATL",
    "ATTIJARIWAFA_BANK":"ATW","AUTO_HALL":"ATH","AUTO_NEJMA":"NEJ",
    "BALIMA":"BAL","BANK_OF_AFRICA_GROUPE_BMCE_BOA":"BOA",
    "BANQUE_CENTRALE_POPULAIRE_BCP":"BCP","BMCI":"BCI","CARTIER_SAADA":"CRS",
    "CDG_CAPITAL":"CDG","CFG_BANK":"CFG","CIH_BANK":"CIH",
    "CIMENTS_DU_MAROC":"CMA","CMGP_GROUP":"CMG","COLORADO_SA":"COL",
    "COMPAGNIE_MINIERE_DE_TOUISSIT_CMT":"CMT","COSUMAR":"CSR",
    "CREDIT_AGRICOLE_DU_MAROC_CAM":"CAM","CREDIT_DU_MAROC_CDM":"CDM",
    "CTM":"CTM","DARI_COUSPATE":"DRI","DELTA_HOLDING_S_A":"DHO",
    "DISTY_TECHNOLOGIES":"DYT","DISWAY":"DWY","ENNAKL_AUTOMOBILES":"NKL",
    "EQDOM":"EQD","FEC":"FEC","FENIE_BROSSETTE":"FBR","HPS_SA":"HPS",
    "INVOLYS":"INV","JAIDA":"JAI","JET_CONTRACTORS":"JET",
    "LABEL_VIE_S_A":"LBV","LAFARGEHOLCIM_MAROC":"LHM","LESIEUR_CRISTAL":"LES",
    "LYDEC":"LYD","M2M_GROUP":"M2M","MAGHREBAIL":"MAB","MAGHREB_STEEL":"MGS",
    "MANAGEM":"MNG","MAROC_LEASING_SA":"MLE","MAROC_TELECOM":"IAM",
    "MARSA_MAROC":"MSA","MED_PAPER_EX_PAPELERA_DE_TETUAN":"MDP",
    "MICRODATA":"MIC","MUTANDIS_SCA":"MUT","OCP":"OCP","ONCF":"ONCF",
    "OULMES":"OUL","PROMOPHARM":"PRO","RCI_FINANCE_MAROC":"RCI",
    "REBAB_COMPANY":"REB","RESIDENCES_DAR_SAADA_RDS":"RDS","RISMA":"RIS",
    "S2M":"S2M","SAHAM_BANK":"SBK","SAHAM_LEASING":"SHL","SALAFIN":"SLF",
    "SANLAM_MAROC_EX_SAHAM_ASSURANCE":"SAH","SMI":"SMI","SNEP":"SNP",
    "SOCIETE_DES_BOISSONS_DU_MAROC_SBM":"SBM","SOFAC":"SOF","SONASID":"SID",
    "SOTHEMA":"SOT","STOKVIS_NORD_AFRIQUE":"SNA","STROC":"STR",
    "TANGER_MED_PORT_AUTHORITY":"TMP","TAQA_MOROCCO_EX_JLEC":"TQM",
    "TGCC_SA":"TGC","TOTALENERGIES_MARKETING_MAROC":"TMA","UNIMER":"UMR",
    "WAFABAIL":"WFB","WAFASALAF":"WFS","WAFA_ASSURANCE":"WAA","ZELLIDJA":"ZDJ",
}

COMPANY_NAMES = {
    "ADDOHA":"Addoha","ADM":"Autoroutes du Maroc","AFMA":"AFMA Groupe",
    "AFRIC_INDUSTRIES_SA":"Afric Industries",
    "AGENCE_NATIONALE_DES_PORTS_ANP":"ANP","AGMA":"Agma","AKDITAL":"Akdital",
    "ALLIANCES_DARNA":"Alliances Darna",
    "ALLIANCES_DEVELOPPEMENT_IMMOBILIER_ADI":"Alliances Développement",
    "ALUMINIUM_DU_MAROC":"Aluminium du Maroc","ARADEI_CAPITAL":"Aradei Capital",
    "ATLANTASANAD":"AtlantaSanad","ATTIJARIWAFA_BANK":"Attijariwafa Bank",
    "AUTO_HALL":"Auto Hall","AUTO_NEJMA":"Auto Nejma","BALIMA":"Balima",
    "BANK_OF_AFRICA_GROUPE_BMCE_BOA":"Bank of Africa",
    "BANQUE_CENTRALE_POPULAIRE_BCP":"Banque Centrale Populaire","BMCI":"BMCI",
    "CARTIER_SAADA":"Cartier Saada","CDG_CAPITAL":"CDG Capital",
    "CFG_BANK":"CFG Bank","CIH_BANK":"CIH Bank",
    "CIMENTS_DU_MAROC":"Ciments du Maroc","CMGP_GROUP":"CMGP Group",
    "COLORADO_SA":"Colorado","COMPAGNIE_MINIERE_DE_TOUISSIT_CMT":"CMT",
    "COSUMAR":"Cosumar","CREDIT_AGRICOLE_DU_MAROC_CAM":"Crédit Agricole du Maroc",
    "CREDIT_DU_MAROC_CDM":"Crédit du Maroc","CTM":"CTM",
    "DARI_COUSPATE":"Dari Couspate","DELTA_HOLDING_S_A":"Delta Holding",
    "DISTY_TECHNOLOGIES":"Disty Technologies","DISWAY":"Disway",
    "ENNAKL_AUTOMOBILES":"Ennakl","EQDOM":"Eqdom","FEC":"FEC",
    "FENIE_BROSSETTE":"Fenie Brossette","HPS_SA":"HPS","INVOLYS":"Involys",
    "JAIDA":"Jaida","JET_CONTRACTORS":"Jet Contractors","LABEL_VIE_S_A":"Label Vie",
    "LAFARGEHOLCIM_MAROC":"LafargeHolcim Maroc","LESIEUR_CRISTAL":"Lesieur Cristal",
    "LYDEC":"Lydec","M2M_GROUP":"M2M Group","MAGHREBAIL":"Maghrebail",
    "MAGHREB_STEEL":"Maghreb Steel","MANAGEM":"Managem",
    "MAROC_LEASING_SA":"Maroc Leasing","MAROC_TELECOM":"Maroc Telecom",
    "MARSA_MAROC":"Marsa Maroc","MED_PAPER_EX_PAPELERA_DE_TETUAN":"Med Paper",
    "MICRODATA":"Microdata","MUTANDIS_SCA":"Mutandis","OCP":"OCP","ONCF":"ONCF",
    "OULMES":"Oulmès","PROMOPHARM":"Promopharm","RCI_FINANCE_MAROC":"RCI Finance Maroc",
    "REBAB_COMPANY":"Rebab Company","RESIDENCES_DAR_SAADA_RDS":"Résidences Dar Saada",
    "RISMA":"Risma","S2M":"S2M","SAHAM_BANK":"Saham Bank",
    "SAHAM_LEASING":"Saham Leasing","SALAFIN":"Salafin",
    "SANLAM_MAROC_EX_SAHAM_ASSURANCE":"Sanlam Maroc","SMI":"SMI","SNEP":"SNEP",
    "SOCIETE_DES_BOISSONS_DU_MAROC_SBM":"SBM","SOFAC":"Sofac","SONASID":"Sonasid",
    "SOTHEMA":"Sothema","STOKVIS_NORD_AFRIQUE":"Stokvis Nord Afrique",
    "STROC":"Stroc Industrie","TANGER_MED_PORT_AUTHORITY":"Tanger Med",
    "TAQA_MOROCCO_EX_JLEC":"TAQA Morocco","TGCC_SA":"TGCC",
    "TOTALENERGIES_MARKETING_MAROC":"TotalEnergies Marketing Maroc",
    "UNIMER":"Unimer","WAFABAIL":"Wafabail","WAFASALAF":"Wafasalaf",
    "WAFA_ASSURANCE":"Wafa Assurance","ZELLIDJA":"Zellidja",
}

SECTOR_MAP = {
    "AFMA":"Assurance & Courtage","ATLANTASANAD":"Assurance",
    "WAFA_ASSURANCE":"Assurance","SANLAM_MAROC_EX_SAHAM_ASSURANCE":"Assurance",
    "ATTIJARIWAFA_BANK":"Banques","BANQUE_CENTRALE_POPULAIRE_BCP":"Banques",
    "BMCI":"Banques","CIH_BANK":"Banques","CFG_BANK":"Banques",
    "BANK_OF_AFRICA_GROUPE_BMCE_BOA":"Banques","CDG_CAPITAL":"Banques",
    "CREDIT_AGRICOLE_DU_MAROC_CAM":"Banques","CREDIT_DU_MAROC_CDM":"Banques",
    "SAHAM_BANK":"Banques","EQDOM":"Crédit à la Consommation",
    "MAROC_LEASING_SA":"Leasing","MAGHREBAIL":"Leasing","SOFAC":"Leasing",
    "WAFABAIL":"Leasing","WAFASALAF":"Crédit à la Consommation",
    "SALAFIN":"Crédit à la Consommation","SAHAM_LEASING":"Leasing",
    "RCI_FINANCE_MAROC":"Leasing","JAIDA":"Finance",
    "OCP":"Mines & Chimie","MANAGEM":"Mines","SMI":"Mines",
    "COMPAGNIE_MINIERE_DE_TOUISSIT_CMT":"Mines","ZELLIDJA":"Mines",
    "CIMENTS_DU_MAROC":"Matériaux de Construction","LAFARGEHOLCIM_MAROC":"Matériaux de Construction",
    "SONASID":"Sidérurgie","MAGHREB_STEEL":"Sidérurgie",
    "ALUMINIUM_DU_MAROC":"Métallurgie",
    "MAROC_TELECOM":"Télécommunications","HPS_SA":"Technologies",
    "M2M_GROUP":"Technologies","DISWAY":"Technologies",
    "DISTY_TECHNOLOGIES":"Technologies","MICRODATA":"Technologies",
    "INVOLYS":"Technologies","S2M":"Technologies",
    "COSUMAR":"Agroalimentaire","LESIEUR_CRISTAL":"Agroalimentaire",
    "DARI_COUSPATE":"Agroalimentaire","CARTIER_SAADA":"Agroalimentaire",
    "OULMES":"Agroalimentaire","UNIMER":"Agroalimentaire",
    "SOCIETE_DES_BOISSONS_DU_MAROC_SBM":"Agroalimentaire",
    "MUTANDIS_SCA":"Agroalimentaire","COLORADO_SA":"Distribution",
    "LABEL_VIE_S_A":"Distribution","AUTO_HALL":"Automobile",
    "AUTO_NEJMA":"Automobile","ENNAKL_AUTOMOBILES":"Automobile",
    "STOKVIS_NORD_AFRIQUE":"Distribution","FENIE_BROSSETTE":"Distribution",
    "TOTALENERGIES_MARKETING_MAROC":"Énergie","TAQA_MOROCCO_EX_JLEC":"Énergie",
    "FEC":"Énergie","LYDEC":"Services Publics",
    "AGENCE_NATIONALE_DES_PORTS_ANP":"Transport","MARSA_MAROC":"Transport",
    "CTM":"Transport","TANGER_MED_PORT_AUTHORITY":"Transport","ONCF":"Transport",
    "ADM":"Infrastructure","RISMA":"Tourisme & Hôtellerie",
    "ADDOHA":"Immobilier","ALLIANCES_DARNA":"Immobilier",
    "ALLIANCES_DEVELOPPEMENT_IMMOBILIER_ADI":"Immobilier",
    "RESIDENCES_DAR_SAADA_RDS":"Immobilier","ARADEI_CAPITAL":"Immobilier",
    "BALIMA":"Assurances","AFRIC_INDUSTRIES_SA":"Industrie",
    "CMGP_GROUP":"Services","DELTA_HOLDING_S_A":"Holding",
    "REBAB_COMPANY":"Industrie","JET_CONTRACTORS":"BTP","TGCC_SA":"BTP",
    "STROC":"BTP","SOTHEMA":"Pharma","PROMOPHARM":"Pharma",
    "SNEP":"Chimie","MED_PAPER_EX_PAPELERA_DE_TETUAN":"Papeterie",
    "AGMA":"Assurance & Courtage","AKDITAL":"Santé",
}

# ── Sanity bounds (in MDH) ────────────────────────────────────────────────────
# (min, max) expected range in MDH for Moroccan listed companies
SANITY_BOUNDS: dict[str, tuple[float, float]] = {
    "chiffre_affaires":          (0.1,    350_000),
    "ebitda":                    (-30_000, 150_000),
    "resultat_exploitation":     (-30_000, 100_000),
    "resultat_financier":        (-50_000,  50_000),
    "resultat_avant_impot":      (-50_000, 100_000),
    "resultat_net":              (-50_000,  80_000),
    "resultat_net_part_groupe":  (-50_000,  80_000),
    "charges_personnel":         (0,        50_000),
    "dotations_amortissements":  (0,        50_000),
    "total_actif":               (0.5,   2_000_000),
    "total_passif":              (0.5,   2_000_000),
    "capitaux_propres":          (-100_000, 500_000),
    "capitaux_propres_groupe":   (-100_000, 500_000),
    "dettes_financieres_lt":     (0,       500_000),
    "dettes_financieres_ct":     (0,       500_000),
    "tresorerie_actif":          (-50_000,  200_000),
    "dette_nette":               (-100_000, 500_000),
    "cfo":                       (-50_000,  150_000),
    "cfi":                       (-200_000,  50_000),
    "cff":                       (-100_000, 100_000),
    "capex":                     (0,        200_000),
    "dividendes_payes":          (0,         50_000),
    "variation_tresorerie":      (-50_000,   50_000),
    "cash_flow_libre":           (-50_000,  150_000),
}


def sanity_rescale(field: str, value: float) -> Optional[float]:
    """
    Check if value is within expected MDH bounds.
    If not, try dividing by 1e6 (raw MAD→MDH) or by 1000 (KDH→MDH).
    Returns None if no valid rescaling found.
    """
    if value is None:
        return None
    bounds = SANITY_BOUNDS.get(field)
    if bounds is None:
        return value  # No check for this field
    lo, hi = bounds
    if lo <= value <= hi:
        return value  # Already in MDH
    v_from_raw = value / 1_000_000
    if lo <= v_from_raw <= hi:
        return round(v_from_raw, 6)
    v_from_kdh = value / 1_000
    if lo <= v_from_kdh <= hi:
        return round(v_from_kdh, 6)
    return None  # Cannot be rescued


# ── Number parsing ─────────────────────────────────────────────────────────────

def parse_number(text: str) -> Optional[float]:
    if not text:
        return None
    text = str(text).strip()
    if text in ('', '-', '—', 'N/A', 'n.d.', 'ns', 'NS', 'n/a', 'nd'):
        return None
    negative = False
    if text.startswith('(') and text.endswith(')'):
        negative = True
        text = text[1:-1].strip()
    elif text.startswith('-'):
        negative = True
        text = text[1:].strip()
    # Normalize whitespace and non-breaking space used as thousands separator
    text = text.replace('\u00a0', ' ').replace('\u202f', ' ')
    if ',' in text:
        text = text.replace('.', '').replace(',', '.')
    elif text.count('.') > 1:
        text = text.replace('.', '')
    text = text.replace(' ', '')
    text = re.sub(r'[^\d.\-]', '', text)
    if not text or text in ('.', ''):
        return None
    try:
        val = float(text)
        return -val if negative else val
    except ValueError:
        return None


def extract_number_from_token(text: str) -> Optional[float]:
    if not text:
        return None
    text = re.sub(r'\s*(Md|Mds|M\b|MMAD|MDHS?|MDH|KDH|KMAD|DH|MAD|%)\s*$', '', str(text).strip(), flags=re.IGNORECASE)
    return parse_number(text)


# ── Unit detection per page ────────────────────────────────────────────────────

def detect_unit(text: str) -> float:
    """
    Detect multiplier to convert extracted numbers to MDH.
    Returns: multiplier such that  extracted_value × multiplier = MDH value
    """
    t = text.lower()
    patterns = [
        # Billions → MDH (×1000)
        (r'en\s+milliards?\b',                   1000.0),
        (r'\ben\s+mmdh\b',                        1000.0),
        (r'\ben\s+mds?\s*(?:de\s+)?(?:dh|mad)',   1000.0),
        (r'\bmmdh\b',                             1000.0),
        # Millions → MDH (×1) — already MDH
        (r'en\s+millions?\s+(?:de\s+)?(?:dh|mad|dirhams?)', 1.0),
        (r'\ben\s+mdh\b',                          1.0),
        (r'\ben\s+mmad\b',                         1.0),
        (r'\ben\s+m\s*(?:dh|mad)\b',               1.0),
        # Thousands → MDH (÷1000)
        (r'en\s+milliers?\s+(?:de\s+)?(?:dh|mad|dirhams?)', 0.001),
        (r'\ben\s+kdh\b',                          0.001),
        (r'\ben\s+kmad\b',                         0.001),
        (r'\bkdh\b',                               0.001),
        # Raw MAD / raw DH → MDH (÷1 000 000)
        (r'en\s+dirhams?\b',                       1e-6),
        (r'\ben\s+mad\b',                          1e-6),
        (r'\ben\s+dh\b',                           1e-6),
    ]
    for pat, mult in patterns:
        if re.search(pat, t):
            return mult
    return 1.0  # Default: assume MDH


# ── Table label matching ───────────────────────────────────────────────────────

TABLE_LABELS: dict[str, list[str]] = {
    "chiffre_affaires": [
        "chiffre d'affaires", "chiffres d'affaires", "ca net", "c.a.",
        "ca consolidé", "revenus", "produit net bancaire", "pnb",
        "primes acquises", "primes émises", "total revenus",
        "produits des activités ordinaires", "chiffre d'affaires consolidé",
    ],
    "ebitda": [
        "ebitda", "excédent brut d'exploitation", "ebe",
        "excedent brut d'exploitation", "résultat brut d'exploitation",
    ],
    "resultat_exploitation": [
        "résultat d'exploitation", "resultat d'exploitation",
        "résultat d'exploitation courant", "rex", "rebit",
        "résultat opérationnel",
    ],
    "resultat_financier": [
        "résultat financier", "resultat financier",
        "coût de l'endettement net",
    ],
    "resultat_avant_impot": [
        "résultat avant impôt", "résultat avant is",
        "resultat avant impot",
    ],
    "resultat_net": [
        "résultat net", "resultat net", "bénéfice net",
        "résultat net des entreprises intégrées",
        "résultat de l'ensemble consolidé",
    ],
    "resultat_net_part_groupe": [
        "résultat net part du groupe", "resultat net part du groupe",
        "rnpg", "résultat net pdg", "résultat net — part du groupe",
        "résultat net - part du groupe",
    ],
    "charges_personnel": [
        "charges de personnel", "charges du personnel", "frais de personnel",
    ],
    "dotations_amortissements": [
        "dotations nettes aux amortissements", "dotations aux amortissements",
        "dotations amortissements",
    ],
    # Balance sheet
    "total_actif": [
        "total actif", "total de l'actif", "total bilan", "total du bilan",
        "total general actif",
    ],
    "total_passif": [
        "total passif", "total du passif", "total general passif",
    ],
    "capitaux_propres": [
        "capitaux propres", "fonds propres", "total des capitaux propres",
        "capitaux propres part du groupe",
    ],
    "capitaux_propres_groupe": [
        "capitaux propres part du groupe", "capitaux propres pdg",
        "capitaux propres - part du groupe",
    ],
    "dettes_financieres_lt": [
        "dettes financières non courantes", "emprunts et dettes financières lt",
        "dettes envers les établissements de crédit lt",
        "passifs financiers non courants",
    ],
    "dettes_financieres_ct": [
        "dettes financières courantes", "concours bancaires",
        "dettes envers les établissements de crédit ct",
    ],
    "tresorerie_actif": [
        "trésorerie et équivalent de trésorerie", "trésorerie actif",
        "disponibilités et équivalents",
    ],
    "dette_nette": [
        "dette nette", "endettement net",
    ],
    # Cash flow
    "cfo": [
        "flux net de trésorerie provenant de l'exploitation",
        "flux de trésorerie d'exploitation",
        "flux d'exploitation net", "cash flow opérationnel net",
        "flux de trésorerie liés aux activités d'exploitation",
        "total flux d'exploitation",
    ],
    "cfi": [
        "flux net de trésorerie liés aux opérations d'investissement",
        "flux de trésorerie d'investissement",
        "flux liés aux investissements",
        "total flux d'investissement",
    ],
    "cff": [
        "flux net de trésorerie liés aux activités de financement",
        "flux de trésorerie de financement",
        "flux liés au financement", "total flux de financement",
    ],
    "capex": [
        "acquisition des immobilisations", "acquisitions corporelles",
        "investissements réalisés", "investissements nets",
        "capex",
    ],
    "dividendes_payes": [
        "dividendes payés", "distributions de bénéfices",
        "dividendes versés", "dividendes distribués",
    ],
    "variation_tresorerie": [
        "variation de la trésorerie nette",
        "variation nette de la trésorerie",
        "variation de trésorerie",
    ],
    # ESG
    "effectif": [
        "effectif global", "effectif total", "nombre de collaborateurs",
        "effectif moyen",
    ],
}


def normalize_label(text: str) -> str:
    if not text:
        return ""
    text = str(text).lower().strip()
    text = text.replace('\u2019', "'").replace('\u2018', "'")
    text = text.replace('\u2013', '-').replace('\u2014', '-')
    text = re.sub(r'^[\s•\-–—·\.]+', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def match_label(cell_text: str, target_labels: list[str]) -> bool:
    norm = normalize_label(cell_text)
    if not norm or len(norm) < 3:
        return False
    for label in target_labels:
        if label in norm or norm in label:
            return True
    return False


# ── Table extraction ───────────────────────────────────────────────────────────

def extract_from_tables(pdf_path: str) -> tuple[dict, dict]:
    """
    Returns (current_year, prior_year) dicts of field → MDH value.
    Tries to identify 2024 and 2023 columns from table headers.
    """
    current: dict = {}
    prior: dict   = {}

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                try:
                    tables = page.extract_tables()
                    if not tables:
                        continue
                    page_text = page.extract_text() or ""
                    page_mult = detect_unit(page_text)

                    for table in tables:
                        if not table or len(table) < 2:
                            continue
                        header_row = table[0] or []

                        # Identify columns
                        col_2024 = col_2023 = None
                        for ci, cell in enumerate(header_row):
                            if cell:
                                s = str(cell)
                                if "2024" in s and col_2024 is None:
                                    col_2024 = ci
                                elif "2023" in s and col_2023 is None:
                                    col_2023 = ci

                        # Default fallback: look for "31/12/2024" or "2024" anywhere in header
                        if col_2024 is None:
                            for ci, cell in enumerate(header_row):
                                if cell and re.search(r'2024', str(cell)):
                                    col_2024 = ci
                                    break
                        if col_2024 is None and len(header_row) >= 2:
                            col_2024 = 1
                        if col_2023 is None and col_2024 is not None:
                            # Try column immediately after 2024
                            if col_2024 + 1 < len(header_row):
                                col_2023 = col_2024 + 1

                        for row in table[1:]:
                            if not row or not row[0]:
                                continue
                            label_cell = str(row[0]).strip()
                            for field_name, target_labels in TABLE_LABELS.items():
                                if match_label(label_cell, target_labels):
                                    # Try per-row unit override
                                    row_text = " ".join(str(c) for c in row if c)
                                    row_mult = detect_unit(row_text)
                                    mult = row_mult if row_mult != 1.0 else page_mult

                                    def get_val(col_idx):
                                        if col_idx is None or col_idx >= len(row):
                                            return None
                                        cell = row[col_idx]
                                        if not cell:
                                            return None
                                        v = extract_number_from_token(str(cell))
                                        if v is None:
                                            return None
                                        raw = v * mult
                                        return sanity_rescale(field_name, raw)

                                    val_cur = get_val(col_2024)
                                    val_pri = get_val(col_2023)

                                    # Fallback: first numeric cell after label
                                    if val_cur is None:
                                        for ci in range(1, min(len(row), 4)):
                                            v = extract_number_from_token(str(row[ci] or ""))
                                            if v is not None:
                                                raw = v * mult
                                                val_cur = sanity_rescale(field_name, raw)
                                                if val_cur is not None:
                                                    break

                                    if val_cur is not None:
                                        current[field_name] = val_cur
                                    if val_pri is not None:
                                        prior[field_name] = val_pri
                                    break
                except Exception:
                    continue
    except Exception:
        pass
    return current, prior


# ── Narrative extraction ───────────────────────────────────────────────────────

def _unit_mult(unit: str) -> float:
    u = unit.lower().strip()
    if u in ('md', 'mds', 'mmdh', 'mmd', 'mmad'):
        return 1000.0
    if u in ('m', 'mmad', 'mdh', 'mdhs', 'm mad'):
        return 1.0
    if u in ('k', 'kdh', 'kmad'):
        return 0.001
    return 1.0

_NUM = r"([\d\s]+(?:[.,]\d+)?)"
_UNIT = r"(M(?:d(?:s)?)?H?|Md(?:s)?|MMAD|MDHS?|MDH|M\b)"

NARRATIVE_PATTERNS: list[tuple[str, list[str]]] = [
    ("chiffre_affaires", [
        rf"(?:chiffre\s+d['\u2019]affaires?|CA)\s+(?:consolid[ée]\s+)?(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
        rf"produit\s+net\s+bancaire\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
        rf"revenus?\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
    ]),
    ("ebitda", [
        rf"(?:EBITDA|EBE)\s+(?:consolid[ée]\s+)?(?:de\s+|[àa]\s+|:\s*|en\s+hausse\s+[àa]\s+){_NUM}\s*{_UNIT}",
        rf"(?:EBITDA|EBE)\s+(?:\w+\s+)*(?:s['\u2019]établit|ressort)\s+[àa]\s+{_NUM}\s*{_UNIT}",
    ]),
    ("resultat_net", [
        rf"r[ée]sultat\s+net\s+(?:consolid[ée]\s+)?(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
        rf"(?:RN|R\.N\.)\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
    ]),
    ("resultat_net_part_groupe", [
        rf"r[ée]sultat\s+net\s+part\s+(?:du\s+)?groupe\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
        rf"RNPG\s+(?:de\s+|[àa]\s+|:\s*|s['\u2019]établit\s+[àa]\s+){_NUM}\s*{_UNIT}",
    ]),
    ("resultat_exploitation", [
        rf"r[ée]sultat\s+d['\u2019]exploitation\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
    ]),
    ("dette_nette", [
        rf"dette\s+nette\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
        rf"endettement\s+net\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
    ]),
    ("total_actif", [
        rf"total\s+(?:de\s+l['\u2019])?actif\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
        rf"total\s+bilan\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
    ]),
    ("cfo", [
        rf"(?:cash[\s-]?flow|flux)\s+(?:de\s+)?(?:tr[ée]sorerie\s+)?op[ée]rationnel\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
        rf"capacit[ée]\s+d['\u2019]autofinancement\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
    ]),
    ("capex", [
        rf"(?:capex|investissements?\s+r[ée]alis[ée]s?)\s+(?:de\s+|[àa]\s+|:\s*){_NUM}\s*{_UNIT}",
    ]),
]


def extract_from_narrative(text: str) -> dict:
    results = {}
    for field_name, patterns in NARRATIVE_PATTERNS:
        for pattern in patterns:
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            if matches:
                m = matches[-1]
                val = parse_number(m.group(1))
                if val is not None:
                    mult = _unit_mult(m.group(2))
                    raw = val * mult
                    checked = sanity_rescale(field_name, raw)
                    if checked is not None:
                        results[field_name] = checked
                        break
    return results


# ── Dividende par action extraction ───────────────────────────────────────────

def extract_dividende(text: str) -> Optional[float]:
    patterns = [
        r"dividende\s+(?:par|/)\s*action\s+(?:de\s+|:\s*)?(\d+[.,]?\d*)\s*(?:DH|MAD|dirhams?)",
        r"(\d+[.,]?\d*)\s*(?:DH|MAD|dirhams?)\s+(?:par|/)\s*action",
        r"distribu\w+\s+(?:un\s+)?dividende\s+(?:de\s+)?(\d+[.,]?\d*)\s*(?:DH|MAD)",
        r"soit\s+(\d+[.,]?\d*)\s*(?:DH|MAD|dirhams?)\s+(?:par|/)\s*action",
        r"(\d+)\s*dirhams?\s+par\s+action",
    ]
    for pattern in patterns:
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        if matches:
            v = parse_number(matches[-1].group(1))
            if v is not None and 0 < v < 10_000:
                return v
    return None


# ── EPS extraction ─────────────────────────────────────────────────────────────

def extract_eps(text: str) -> Optional[float]:
    patterns = [
        r"r[ée]sultat\s+(?:de\s+base\s+)?par\s+action\s+(?:de\s+|:\s*)?(\d+[.,]?\d*)\s*(?:DH|MAD)",
        r"(?:BPA|EPS)\s*(?:de\s+|:\s*)?(\d+[.,]?\d*)\s*(?:DH|MAD)",
        r"b[ée]n[ée]fice\s+(?:net\s+)?par\s+action\s+(?:de\s+|:\s*)?(\d+[.,]?\d*)\s*(?:DH|MAD)",
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            v = parse_number(m.group(1))
            if v is not None and 0 < v < 100_000:
                return v
    return None


# ── ESG extraction ─────────────────────────────────────────────────────────────

def extract_esg(text: str) -> dict:
    esg = {
        "effectif": None, "femmes_pct": None, "hommes_pct": None,
        "recrutements": None, "demissions": None, "accidents_travail": None,
        "papier_par_employe_kg": None, "energie_par_employe_kwh": None,
        "eau_par_employe_m3": None,
    }

    # Effectif
    for pat in [
        r"effectif\s+(?:global|total)\s*(?:de\s+|:\s*)?(\d[\d\s]*)",
        r"nombre\s+(?:de\s+)?(?:collaborateurs?|employ[ée]s?)\s*(?:de\s+|:\s*)?(\d[\d\s]*)",
        r"(\d[\d\s]*)\s+(?:collaborateurs?|employ[ée]s?)",
    ]:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            v = parse_number(m.group(1).replace(' ', ''))
            if v and 1 < v < 200_000:
                esg["effectif"] = int(v)
                break

    # Gender split
    for pat in [
        r"(\d{1,2})[,.]?\d*\s*%\s*(?:de\s+)?femmes",
        r"femmes?\s*[:\s]+(\d{1,2})[,.]?\d*\s*%",
        r"(\d{1,2})\s*%\s*f(?:emmes?)?[^\d]",
    ]:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            v = parse_number(m.group(1))
            if v and 0 < v < 100:
                esg["femmes_pct"] = v
                esg["hommes_pct"] = round(100 - v, 1)
                break

    # Recrutements
    for pat in [
        r"recrut\w+\s*(?:de\s+|:\s*)?(\d[\d\s]*)\s*(?:personnes?|collaborateurs?|embauches?)?",
        r"(\d[\d\s]*)\s*(?:nouvelles?\s+)?recrues?\b",
    ]:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            v = parse_number(m.group(1).replace(' ', ''))
            if v and 0 < v < 10_000:
                esg["recrutements"] = int(v)
                break

    # Accidents
    for pat in [
        r"accidents?\s+(?:de\s+)?travail\s*(?::\s*|de\s+)?(\d+)",
        r"(\d+)\s+accidents?\s+(?:de\s+)?travail",
    ]:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            v = parse_number(m.group(1))
            if v is not None and 0 <= v < 1_000:
                esg["accidents_travail"] = int(v)
                break

    return esg


# ── Main per-company extraction ────────────────────────────────────────────────

def extract_company_data(folder_name: str, pdf_path: str) -> dict:
    ticker       = TICKER_MAP.get(folder_name, folder_name[:4].upper())
    company_name = COMPANY_NAMES.get(folder_name, folder_name.replace("_", " ").title())
    sector       = SECTOR_MAP.get(folder_name, "")

    # Read full text
    full_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            pages = []
            for page in pdf.pages:
                try:
                    t = page.extract_text()
                    if t:
                        pages.append(t)
                except Exception:
                    pass
            full_text = "\n\n".join(pages)
    except Exception as e:
        raise RuntimeError(f"Cannot open PDF: {e}")

    if len(full_text.strip()) < 100:
        raise RuntimeError("PDF appears empty or scanned (no text layer)")

    # Multi-strategy extraction
    table_cur, table_pri  = extract_from_tables(pdf_path)
    narrative             = extract_from_narrative(full_text)

    warnings_list = []

    def merge(*dicts) -> dict:
        """Later dicts take priority only if earlier is None."""
        result = {}
        for d in dicts:
            for k, v in d.items():
                if v is not None and (k not in result or result[k] is None):
                    result[k] = v
        return result

    # Tables win for most fields; narrative fills gaps
    merged = merge(table_cur, narrative)
    merged_n1 = dict(table_pri)

    # Special extractions from full text
    dividende = extract_dividende(full_text)
    eps       = extract_eps(full_text)
    esg       = extract_esg(full_text)

    def g(field: str, d: dict = merged) -> Optional[float]:
        return d.get(field)

    # ── Income statement ──────────────────────────────────────────────────────
    ca      = g("chiffre_affaires")
    ebitda  = g("ebitda")
    ebit    = g("resultat_exploitation")
    rf      = g("resultat_financier")
    rai     = g("resultat_avant_impot")
    rn      = g("resultat_net")
    rnpg    = g("resultat_net_part_groupe") or rn
    cp_pers = g("charges_personnel")
    dot_amo = g("dotations_amortissements")

    ca_n1   = g("chiffre_affaires", merged_n1)
    rnpg_n1 = g("resultat_net_part_groupe", merged_n1) or g("resultat_net", merged_n1)
    ebitda_n1 = g("ebitda", merged_n1)

    # ── Balance sheet ─────────────────────────────────────────────────────────
    total_actif  = g("total_actif")
    total_passif = g("total_passif")
    cp           = g("capitaux_propres")
    cp_groupe    = g("capitaux_propres_groupe") or cp
    dlt          = g("dettes_financieres_lt")
    dct          = g("dettes_financieres_ct")
    tres         = g("tresorerie_actif")
    dette_nette  = g("dette_nette")

    # Compute net debt if not found
    if dette_nette is None and dlt is not None and tres is not None:
        raw_dn = (dlt or 0) + (dct or 0) - tres
        dette_nette = sanity_rescale("dette_nette", raw_dn)

    # ── Cash flow ─────────────────────────────────────────────────────────────
    cfo     = g("cfo")
    cfi     = g("cfi")
    cff     = g("cff")
    capex   = g("capex")
    div_pay = g("dividendes_payes")
    var_tre = g("variation_tresorerie")

    # Free cash flow
    fcf = None
    if cfo is not None and capex is not None:
        fcf = round(cfo - capex, 4)
    elif cfo is not None and cfi is not None:
        fcf = round(cfo + cfi, 4)

    # ── Derived ratios ────────────────────────────────────────────────────────
    def safe_div(a, b, pct=True):
        if a is None or b is None or b == 0:
            return None
        return round((a / b) * (100 if pct else 1), 2)

    ratios = {
        "marge_ebitda_pct":     safe_div(ebitda, ca),
        "marge_nette_pct":      safe_div(rnpg, ca),
        "marge_exploitation_pct": safe_div(ebit, ca),
        "roe":                  safe_div(rnpg, cp_groupe),
        "dette_nette_ebitda":   safe_div(dette_nette, ebitda, pct=False) if dette_nette and ebitda and ebitda > 0 else None,
        "payout_ratio_pct":     safe_div(div_pay, rnpg) if div_pay and rnpg and rnpg > 0 else None,
        "capex_intensity_pct":  safe_div(capex, ca),
        "ratio_endettement":    safe_div((dlt or 0) + (dct or 0), cp_groupe, pct=False) if cp_groupe and cp_groupe != 0 else None,
        "free_cash_flow":       fcf,
    }

    # ── YoY growth ────────────────────────────────────────────────────────────
    def yoy(v_cur, v_pri):
        if v_cur is None or v_pri is None or v_pri == 0:
            return None
        return round((v_cur - v_pri) / abs(v_pri) * 100, 2)

    growth = {
        "revenue_growth_pct":  yoy(ca, ca_n1),
        "rnpg_growth_pct":     yoy(rnpg, rnpg_n1),
        "ebitda_growth_pct":   yoy(ebitda, ebitda_n1),
    }

    # ── Historical series ──────────────────────────────────────────────────────
    historical = {
        "revenue":  [{"year": 2023, "value": ca_n1},    {"year": 2024, "value": ca}],
        "rnpg":     [{"year": 2023, "value": rnpg_n1},  {"year": 2024, "value": rnpg}],
        "ebitda":   [{"year": 2023, "value": ebitda_n1},{"year": 2024, "value": ebitda}],
        "dividende":[{"year": 2023, "value": None},      {"year": 2024, "value": dividende}],
    }

    # ── Quality score ─────────────────────────────────────────────────────────
    key_fields = [ca, ebitda, rnpg, total_actif, cp, cfo, capex, dividende]
    n_found    = sum(1 for v in key_fields if v is not None)
    coverage   = round(n_found / len(key_fields) * 100, 1)

    # Balance check warning
    if total_actif and total_passif:
        diff_pct = abs(total_actif - total_passif) / total_actif * 100
        if diff_pct > 5:
            warnings_list.append(f"Bilan déséquilibré: actif={total_actif:.1f} vs passif={total_passif:.1f} MDH ({diff_pct:.1f}%)")

    return {
        "ticker":        ticker,
        "company_name":  company_name,
        "sector":        sector,
        "annee":         2024,
        "source_pdf":    os.path.relpath(pdf_path, PDF_ROOT),
        "date_extraction": date.today().isoformat(),
        "currency":      "MDH",

        "income_statement": {
            "chiffre_affaires":         _r(ca),
            "chiffre_affaires_n1":      _r(ca_n1),
            "ebitda":                   _r(ebitda),
            "ebitda_n1":                _r(ebitda_n1),
            "resultat_exploitation":    _r(ebit),
            "resultat_financier":       _r(rf),
            "resultat_avant_impot":     _r(rai),
            "resultat_net":             _r(rn),
            "resultat_net_part_groupe": _r(rnpg),
            "resultat_net_n1":          _r(rnpg_n1),
            "eps":                      _r(eps),
            "dividende_par_action":     _r(dividende),
            "charges_personnel":        _r(cp_pers),
            "dotations_amortissements": _r(dot_amo),
        },

        "balance_sheet": {
            "total_actif":              _r(total_actif),
            "total_passif":             _r(total_passif),
            "capitaux_propres_groupe":  _r(cp_groupe),
            "capitaux_propres":         _r(cp),
            "dettes_financieres_lt":    _r(dlt),
            "dettes_financieres_ct":    _r(dct),
            "tresorerie_actif":         _r(tres),
            "dette_nette":              _r(dette_nette),
        },

        "cash_flow": {
            "cfo":                _r(cfo),
            "cfi":                _r(cfi),
            "cff":                _r(cff),
            "capex":              _r(capex),
            "dividendes_payes":   _r(div_pay),
            "variation_tresorerie": _r(var_tre),
            "free_cash_flow":     _r(fcf),
        },

        "ratios": ratios,
        "growth": growth,
        "historical": historical,
        "esg": esg,

        "extraction_quality": {
            "fields_found":    n_found,
            "fields_total":    len(key_fields),
            "coverage_pct":    coverage,
            "warnings":        warnings_list,
        },
    }


def _r(v: Optional[float]) -> Optional[float]:
    """Round to 4 decimal places or None."""
    return round(v, 4) if v is not None else None


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("=" * 72)
    print("  AMMC PDF Financial Data Extraction — V3")
    print("=" * 72)
    print(f"Source: {PDF_ROOT}")
    print(f"Output: {OUTPUT_DIR}\n")

    if not PDF_ROOT.exists():
        print(f"ERROR: {PDF_ROOT} not found"); sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    companies = []
    for folder in sorted(PDF_ROOT.iterdir()):
        if not folder.is_dir():
            continue
        pdfs = list(folder.glob("*.pdf")) + list(folder.glob("*.PDF"))
        for pdf in pdfs:
            companies.append((folder.name, str(pdf)))

    n_folders = len({c[0] for c in companies})
    print(f"Found {n_folders} company folders, {len(companies)} PDFs\n")

    results = []
    logs    = []
    ok = fail = 0

    for i, (folder, pdf_path) in enumerate(companies, 1):
        ticker = TICKER_MAP.get(folder, folder[:4].upper())
        print(f"[{i:03d}/{len(companies)}] {ticker:6s} — {Path(pdf_path).name[:50]}", end=" ")
        try:
            data = extract_company_data(folder, pdf_path)
            results.append(data)
            q = data["extraction_quality"]["coverage_pct"]
            ca = data["income_statement"]["chiffre_affaires"]
            ca_str = f"{ca:.1f} MDH" if ca else "—"
            rn = data["income_statement"]["resultat_net_part_groupe"]
            rn_str = f"{rn:.1f} MDH" if rn else "—"
            print(f"✓  CA={ca_str}  RNPG={rn_str}  [{q:.0f}%]")
            ok += 1
            # Build log entries
            for section in ["income_statement", "balance_sheet", "cash_flow"]:
                for field, value in data.get(section, {}).items():
                    logs.append({
                        "company": data["company_name"],
                        "ticker":  ticker,
                        "field":   field,
                        "status":  "ok" if value is not None else "missing",
                        "value":   value,
                    })
        except Exception as e:
            print(f"✗  ERROR: {e}")
            fail += 1
            logs.append({
                "company": folder, "ticker": ticker,
                "field": "_pdf", "status": "error", "value": str(e),
            })

    # Save outputs
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    with open(OUTPUT_LOG, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)

    # Summary table
    print("\n" + "─" * 72)
    print(f"{'Société':<30} {'Tick':<6} {'CA (MDH)':>10} {'RNPG (MDH)':>12} {'Cov%':>6}")
    print("─" * 72)
    for d in sorted(results, key=lambda x: x["company_name"]):
        ca   = d["income_statement"]["chiffre_affaires"]
        rnpg = d["income_statement"]["resultat_net_part_groupe"]
        cov  = d["extraction_quality"]["coverage_pct"]
        print(f"{d['company_name']:<30} {d['ticker']:<6} "
              f"{(str(round(ca,1)) if ca else '—'):>10} "
              f"{(str(round(rnpg,1)) if rnpg else '—'):>12} "
              f"{cov:>5.0f}%")

    print("─" * 72)
    print(f"\n✓ {ok} companies OK   ✗ {fail} errors")
    print(f"Output: {OUTPUT_JSON}")
    print(f"Log:    {OUTPUT_LOG}")


if __name__ == "__main__":
    main()
