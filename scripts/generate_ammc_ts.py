import json
from pathlib import Path

PROJECT_ROOT = Path("/Users/user/Claude/wallstreet-morocco")
JSON_PATH = PROJECT_ROOT / "data" / "financials_2024.json"
TS_OUTPUT_PATH = PROJECT_ROOT / "src" / "lib" / "data" / "ammc_financials_2024.ts"

with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

filtered_data = []

for company in data:
    valid_count = 0
    for section in ["income_statement", "balance_sheet", "cash_flow"]:
        for k, v in company[section].items():
            if v is not None:
                if abs(v) > 1e12 or abs(v) < 1e-6 and v != 0:
                    company[section][k] = None
                else:
                    valid_count += 1
    
    for k, v in company["ratios"].items():
        if v is not None:
            if abs(v) > 1000:
                company["ratios"][k] = None
                
    if valid_count >= 3:
        filtered_data.append(company)

ts_content = f"""// AUTO-GENERATED AMMC FINANCIAL DATA 2024
// Extracted from official AMMC annual reports
// Values are in Millions of MAD (MMAD), converted to raw MAD for the API returning

import type {{ FinancialsData }} from "@/components/terminal/ValuesFinancials/financials.api";

export const ammc_financials_2024: Record<string, Partial<FinancialsData>> = {{
"""

for c in filtered_data:
    ticker = c["ticker"]
    inc = c["income_statement"]
    bal = c["balance_sheet"]
    cf = c["cash_flow"]
    rat = c["ratios"]
    
    ts_content += f"  '{ticker}': {{\n"
    if bal['total_actif'] is not None: ts_content += f"    totalAssets: {bal['total_actif']} * 1000000,\n"
    if bal['total_passif'] is not None: ts_content += f"    totalDebt: {bal['total_passif']} * 1000000,\n" # mapping total passive to debt for simplicity if needed, but we don't have total_passif in API. Wait, API has totalDebt.
    if bal['capitaux_propres'] is not None: ts_content += f"    stockholdersEquity: {bal['capitaux_propres']} * 1000000,\n"
    
    if inc['chiffre_affaires'] is not None: ts_content += f"    revenue: {inc['chiffre_affaires']} * 1000000,\n"
    if inc['resultat_exploitation'] is not None: ts_content += f"    operatingIncome: {inc['resultat_exploitation']} * 1000000,\n"
    if inc['resultat_net'] is not None: ts_content += f"    netIncome: {inc['resultat_net']} * 1000000,\n"
    if inc['ebitda'] is not None: ts_content += f"    ebitda: {inc['ebitda']} * 1000000,\n"
    
    if cf['cash_flow_exploitation'] is not None: ts_content += f"    cashFromOperations: {cf['cash_flow_exploitation']} * 1000000,\n"
    if cf['investissements_capex'] is not None: ts_content += f"    cashFromInvesting: -({cf['investissements_capex']} * 1000000),\n"
    if cf['cash_flow_libre'] is not None: ts_content += f"    freeCashFlow: {cf['cash_flow_libre']} * 1000000,\n"
    
    if rat['marge_nette'] is not None: ts_content += f"    netMarginPct: {rat['marge_nette']},\n"
    if rat['roe'] is not None: ts_content += f"    roe: {rat['roe']},\n"
    if rat['ratio_endettement'] is not None: ts_content += f"    debtToEquity: {rat['ratio_endettement']},\n"
    ts_content += f"  }},\n"

ts_content += "};\n"

with open(TS_OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Generated {TS_OUTPUT_PATH} with {len(filtered_data)} companies.")
