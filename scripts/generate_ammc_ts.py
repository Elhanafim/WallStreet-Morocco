#!/usr/bin/env python3
"""
Generate TypeScript data files from the clean financials_2024.json output.

Produces two files:
  src/lib/data/ammc_financials_2024.ts  — Partial<FinancialsData> in raw MAD (existing API)
  src/lib/data/ammc_rich_2024.ts        — AmmcCompanyData in MDH (new rich panel)
"""
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
JSON_PATH    = PROJECT_ROOT / "data" / "financials_2024.json"
OUT_STD      = PROJECT_ROOT / "src" / "lib" / "data" / "ammc_financials_2024.ts"
OUT_RICH     = PROJECT_ROOT / "src" / "lib" / "data" / "ammc_rich_2024.ts"

MDH_TO_MAD = 1_000_000  # MDH → raw MAD

def r(v, decimals=4):
    """Round or None."""
    if v is None:
        return None
    return round(v, decimals)

# Sane bounds for ratios that are percentages
RATIO_PCT_BOUNDS = {
    "marge_ebitda_pct":       (-100, 300),
    "marge_nette_pct":        (-200, 200),
    "marge_exploitation_pct": (-200, 200),
    "roe":                    (-500, 500),
    "payout_ratio_pct":       (0, 300),
    "capex_intensity_pct":    (0, 200),
}

def clean_ratio(key: str, val):
    if val is None:
        return None
    bounds = RATIO_PCT_BOUNDS.get(key)
    if bounds:
        lo, hi = bounds
        if not (lo <= val <= hi):
            return None
    return val

def ts_val(v):
    """Format a Python value as TypeScript literal."""
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        escaped = v.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
        return f'"{escaped}"'
    if isinstance(v, list):
        items = ", ".join(ts_val(i) for i in v)
        return f"[{items}]"
    if isinstance(v, dict):
        pairs = ", ".join(f'"{k}": {ts_val(val)}' for k, val in v.items())
        return f"{{{pairs}}}"
    return "null"


with open(JSON_PATH, encoding="utf-8") as f:
    raw_data: list[dict] = json.load(f)

# Deduplicate by ticker — keep the entry with highest coverage
seen: dict[str, dict] = {}
for c in raw_data:
    t = c.get("ticker", "")
    if not t:
        continue
    existing = seen.get(t)
    if existing is None:
        seen[t] = c
    else:
        # Keep the one with better coverage
        if c.get("extraction_quality", {}).get("coverage_pct", 0) > existing.get("extraction_quality", {}).get("coverage_pct", 0):
            seen[t] = c

data: list[dict] = list(seen.values())

# ── 1. Standard file (raw MAD for API compatibility) ─────────────────────────

std_lines = [
    "// AUTO-GENERATED — do not edit manually",
    "// Source: data/financials_2024.json  (values converted MDH → raw MAD)",
    "// Regenerate: python3 scripts/generate_ammc_ts.py",
    "",
    'import type { FinancialsData } from "@/components/terminal/ValuesFinancials/financials.api";',
    "",
    "export const ammc_financials_2024: Record<string, Partial<FinancialsData>> = {",
]

for c in data:
    ticker = c.get("ticker", "")
    if not ticker:
        continue
    inc = c.get("income_statement", {})
    bal = c.get("balance_sheet", {})
    cf  = c.get("cash_flow", {})
    rat = c.get("ratios", {})

    def mdh(v):
        if v is None: return None
        return r(v * MDH_TO_MAD)

    fields = {}

    # Revenue (prefer consolidated)
    if inc.get("chiffre_affaires") is not None:
        fields["revenue"] = mdh(inc["chiffre_affaires"])
    if inc.get("resultat_net_part_groupe") is not None:
        fields["netIncome"] = mdh(inc["resultat_net_part_groupe"])
    elif inc.get("resultat_net") is not None:
        fields["netIncome"] = mdh(inc["resultat_net"])
    if inc.get("ebitda") is not None:
        fields["ebitda"] = mdh(inc["ebitda"])
    if inc.get("resultat_exploitation") is not None:
        fields["operatingIncome"] = mdh(inc["resultat_exploitation"])
    if bal.get("total_actif") is not None:
        fields["totalAssets"] = mdh(bal["total_actif"])
    if bal.get("dettes_financieres_lt") is not None:
        fields["totalDebt"] = mdh(bal["dettes_financieres_lt"])
    if bal.get("capitaux_propres") is not None:
        fields["stockholdersEquity"] = mdh(bal["capitaux_propres"])
    if cf.get("cfo") is not None:
        fields["cashFromOperations"] = mdh(cf["cfo"])
    if cf.get("cfi") is not None:
        fields["cashFromInvesting"] = mdh(cf["cfi"])
    if cf.get("cff") is not None:
        fields["cashFromFinancing"] = mdh(cf["cff"])
    if cf.get("free_cash_flow") is not None:
        fields["freeCashFlow"] = mdh(cf["free_cash_flow"])
    if rat.get("marge_nette_pct") is not None:
        fields["netMarginPct"] = r(rat["marge_nette_pct"], 2)
    if rat.get("roe") is not None:
        fields["roe"] = r(rat["roe"], 2)
    if rat.get("ratio_endettement") is not None:
        fields["debtToEquity"] = r(rat["ratio_endettement"], 2)

    if not fields:
        continue

    std_lines.append(f"  '{ticker}': {{")
    for k, v in fields.items():
        if v is not None:
            std_lines.append(f"    {k}: {ts_val(v)},")
    std_lines.append("  },")

std_lines.append("};")

OUT_STD.write_text("\n".join(std_lines) + "\n", encoding="utf-8")
print(f"Wrote {OUT_STD} ({len(data)} companies)")


# ── 2. Rich file (MDH for the new DONNÉES panel) ─────────────────────────────

rich_lines = [
    "// AUTO-GENERATED — do not edit manually",
    "// Source: data/financials_2024.json  (values in MDH)",
    "// Regenerate: python3 scripts/generate_ammc_ts.py",
    "",
    'import type { AmmcCompanyData } from "@/types/ammc";',
    "",
    "export const ammc_rich_2024: Record<string, AmmcCompanyData> = {",
]

for c in data:
    ticker = c.get("ticker", "")
    if not ticker:
        continue
    inc  = c.get("income_statement", {})
    bal  = c.get("balance_sheet",   {})
    cf   = c.get("cash_flow",       {})
    rat  = c.get("ratios",          {})
    gr   = c.get("growth",          {})
    hist = c.get("historical",      {})
    esg  = c.get("esg",             {})
    qual = c.get("extraction_quality", {})

    def v(d, k): return ts_val(d.get(k))

    obj = {
        "ticker":      ticker,
        "companyName": c.get("company_name", ""),
        "sector":      c.get("sector", ""),
        "annee":       c.get("annee", 2024),
        # Income statement (MDH)
        "revenue":               inc.get("chiffre_affaires"),
        "revenueN1":             inc.get("chiffre_affaires_n1"),
        "ebitda":                inc.get("ebitda"),
        "ebitdaN1":              inc.get("ebitda_n1"),
        "ebit":                  inc.get("resultat_exploitation"),
        "resultatFinancier":     inc.get("resultat_financier"),
        "resultatAvantImpot":    inc.get("resultat_avant_impot"),
        "resultatNet":           inc.get("resultat_net"),
        "rnpg":                  inc.get("resultat_net_part_groupe"),
        "rnpgN1":                inc.get("resultat_net_n1"),
        "eps":                   inc.get("eps"),
        "dividendeParAction":    inc.get("dividende_par_action"),
        "chargesPersonnel":      inc.get("charges_personnel"),
        "dotationsAmortissements": inc.get("dotations_amortissements"),
        # Balance sheet (MDH)
        "totalActif":            bal.get("total_actif"),
        "totalPassif":           bal.get("total_passif"),
        "capitauxPropresGroupe": bal.get("capitaux_propres_groupe"),
        "capitauxPropres":       bal.get("capitaux_propres"),
        "dettesFinancieresLT":   bal.get("dettes_financieres_lt"),
        "dettesFinancieresCT":   bal.get("dettes_financieres_ct"),
        "tresorerieActif":       bal.get("tresorerie_actif"),
        "detteNette":            bal.get("dette_nette"),
        # Cash flow (MDH)
        "cfo":                   cf.get("cfo"),
        "cfi":                   cf.get("cfi"),
        "cff":                   cf.get("cff"),
        "capex":                 cf.get("capex"),
        "dividendesPaies":       cf.get("dividendes_payes"),
        "variationTresorerie":   cf.get("variation_tresorerie"),
        "freeCashFlow":          cf.get("free_cash_flow"),
        # Ratios (with sanity bounds)
        "margeEbitdaPct":        clean_ratio("marge_ebitda_pct",       rat.get("marge_ebitda_pct")),
        "margeNettePct":         clean_ratio("marge_nette_pct",        rat.get("marge_nette_pct")),
        "margeExploitationPct":  clean_ratio("marge_exploitation_pct", rat.get("marge_exploitation_pct")),
        "roe":                   clean_ratio("roe",                     rat.get("roe")),
        "detteNetteEbitda":      rat.get("dette_nette_ebitda"),
        "payoutRatioPct":        clean_ratio("payout_ratio_pct",       rat.get("payout_ratio_pct")),
        "capexIntensityPct":     clean_ratio("capex_intensity_pct",    rat.get("capex_intensity_pct")),
        "ratioEndettement":      rat.get("ratio_endettement"),
        # Growth
        "revenueGrowthPct":      gr.get("revenue_growth_pct"),
        "ebitdaGrowthPct":       gr.get("ebitda_growth_pct"),
        "rnpgGrowthPct":         gr.get("rnpg_growth_pct"),
        # Historical
        "historical": {
            "revenue":  hist.get("revenue", []),
            "rnpg":     hist.get("rnpg", []),
            "ebitda":   hist.get("ebitda", []),
            "dividende":hist.get("dividende", []),
        },
        # ESG
        "esg": {
            "effectif":           esg.get("effectif"),
            "femmesPct":          esg.get("femmes_pct"),
            "hommesPct":          esg.get("hommes_pct"),
            "recrutements":       esg.get("recrutements"),
            "demissions":         esg.get("demissions"),
            "accidentsTravail":   esg.get("accidents_travail"),
            "papierParEmployeKg": esg.get("papier_par_employe_kg"),
            "energieParEmployeKwh": esg.get("energie_par_employe_kwh"),
            "eauParEmployeM3":    esg.get("eau_par_employe_m3"),
            "nbAdministrateurs":  None,
            "nbFemmesCA":         None,
            "nbIndependants":     None,
        },
        # Quality
        "extractionQuality": {
            "fieldsCoveredPct": qual.get("coverage_pct", 0),
            "warnings":         qual.get("warnings", []),
        },
    }

    rich_lines.append(f"  '{ticker}': {ts_val(obj)},")

rich_lines.append("};")

OUT_RICH.write_text("\n".join(rich_lines) + "\n", encoding="utf-8")
print(f"Wrote {OUT_RICH} ({len(data)} companies)")
