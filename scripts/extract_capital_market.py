#!/usr/bin/env python3
import os
import re
import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path
import pdfplumber
from datetime import datetime

# Configuration
AMMC_STATS_URL = "https://www.ammc.ma/fr/donnees-statistiques?field_type_stat_value=5"
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_JSON = DATA_DIR / "capital_market_latest.json"

def get_latest_pdf_url():
    print(f"Scraping AMMC page: {AMMC_STATS_URL}")
    response = requests.get(AMMC_STATS_URL, timeout=15)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    links = soup.find_all('a', string=re.compile(r"Indicateurs mensuels du marché des capitaux", re.I))
    
    if not links:
        links = soup.find_all('a', href=re.compile(r"\.pdf$", re.I))
        links = [l for l in links if "Indicateurs mensuels" in l.get_text()]

    if not links:
        raise Exception("Could not find monthly indicators PDF link on the page.")

    latest_link = links[0]
    href = latest_link.get('href')
    if not href.startswith('http'):
        href = f"https://www.ammc.ma{href}"
    
    title = latest_link.get_text(strip=True)
    return title, href

def parse_number(text):
    if not text: return None
    text = text.replace('\u00a0', '').replace(' ', '').replace(',', '.')
    # Extract only matching parts
    match = re.search(r'(-?\d+\.?\d*)', text)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    return None

def extract_data_from_pdf(pdf_path):
    print(f"Parsing PDF: {pdf_path}")
    data = {
        "market_cap": None,
        "masi": None,
        "volume": None,
        "transactions": None,
        "opcvm": {
            "total_assets": None,
            "total_funds": None,
            "categories": []
        },
        "capital_raises": {
            "total": None,
            "equity": None,
            "bonds": None,
            "tcn": None
        },
        "securities_lending": {
            "volume": None,
            "outstanding": None
        }
    }
    
    with pdfplumber.open(pdf_path) as pdf:
        full_text = ""
        for page in pdf.pages:
            # Use specific layout extraction if possible, otherwise normal text
            text = page.extract_text(x_tolerance=2, y_tolerance=2) or ""
            full_text += text + "\n"
        
        # 1. Market Bourse
        # MASI 13 012,45
        masi_match = re.search(r"MASI\s+([\d\s,.]+)", full_text, re.I)
        if masi_match: data["masi"] = parse_number(masi_match.group(1))
        
        # Capitalisation (MMDhs) 674,5
        cap_match = re.search(r"Capitalisation\s*(?:\(MMDhs\))?[\s\n]+([\d\s,.]+)", full_text, re.I)
        if cap_match: data["market_cap"] = parse_number(cap_match.group(1))
        
        # Volume (MDhs) 1 234
        vol_match = re.search(r"Volume\s*(?:\(MDhs\))?[\s\n]+([\d\s,]{3,20})", full_text, re.I)
        if vol_match: data["volume"] = parse_number(vol_match.group(1))

        # 2. OPCVM Breakdown
        # Pattern: Category Funds Assets(MMDH) ChangeYTD
        # Actions 116 78,65 1,86%
        categories = ["Actions", "Diversifiés", "Monétaires", "Obligations CT", "Obligations MLT", "Contractuels"]
        for cat in categories:
            # Look for category followed by 3 numbers/values
            pattern = re.escape(cat) + r"\s+(\d+)\s+([\d\s,.]+)\s+([-]?[\d\s,.]+\%)"
            match = re.search(pattern, full_text)
            if match:
                data["opcvm"]["categories"].append({
                    "category": cat,
                    "funds": int(match.group(1)),
                    "assets": parse_number(match.group(2)),
                    "change_ytd": match.group(3).strip()
                })
        
        total_opcvm = re.search(r"TOTAL\s+(\d+)\s+([\d\s,.]+)\s+([-]?[\d\s,.]+\%)", full_text)
        if total_opcvm:
            data["opcvm"]["total_funds"] = int(total_opcvm.group(1))
            data["opcvm"]["total_assets"] = parse_number(total_opcvm.group(2))

        # 3. Capital Raises - Typically in a table "Levées de capitaux"
        # Column 1 = Flux du mois, Column 2 = Cumul annuel
        # Émissions de titres de capital 450 -
        equity_match = re.search(r"titres de capital(?:\s*\(.*?\))?\s*([-]|[\d\s]{1,10})(?:\s+|$)", full_text)
        if equity_match: 
            val = equity_match.group(1).strip()
            data["capital_raises"]["equity"] = 0 if val == "-" else parse_number(val)
        
        # Émissions obligataires
        bond_match = re.search(r"Émissions obligataires(?:\s*\(.*?\))?\s*([-]|[\d\s]{1,10})(?:\s+|$)", full_text)
        if bond_match:
            val = bond_match.group(1).strip()
            data["capital_raises"]["bonds"] = 0 if val == "-" else parse_number(val)
        
        # Émissions de TCN
        tcn_match = re.search(r"Émissions de TCN\s*([-]|[\d\s]{1,10})(?:\s+|$)", full_text)
        if tcn_match:
            val = tcn_match.group(1).strip()
            data["capital_raises"]["tcn"] = 0 if val == "-" else parse_number(val)
        
        # Total levées
        # Total 7 188 15 128
        total_raises = re.search(r"Total\s*levées.*?\s*([-]|[\d\s]{1,10})(?:\s+|$)", full_text, re.I)
        if not total_raises:
            # Look for "Total" followed by numbers in the capital raise section
            raises_block = full_text[full_text.find("Émissions"):] if "Émissions" in full_text else full_text
            total_raises = re.search(r"Total\s+([\d\s]{1,10})(?:\s+|$)", raises_block)
        
        if total_raises:
            val = total_raises.group(1).strip()
            data["capital_raises"]["total"] = parse_number(val)

        # 4. Securities Lending
        # Prêt-emprunt de titres
        # Encours (MMDhs) 38,5
        sec_lending_section = full_text[full_text.find("Prêt-emprunt"):] if "Prêt-emprunt" in full_text else full_text
        
        lending_outstanding = re.search(r"Encours\s*\(MMDhs\)\s*([\d\s,.]+)", sec_lending_section)
        if lending_outstanding: data["securities_lending"]["outstanding"] = parse_number(lending_outstanding.group(1))
        
        lending_vol = re.search(r"Volume\s*\(MMDhs\)\s*([\d\s,.]+)", sec_lending_section)
        if lending_vol: data["securities_lending"]["volume"] = parse_number(lending_vol.group(1))

    return data

def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        title, pdf_url = get_latest_pdf_url()
        pdf_path = DATA_DIR / "latest_ammc_indicators.pdf"
        print(f"Downloading {pdf_url}...")
        pdf_res = requests.get(pdf_url, timeout=30)
        pdf_res.raise_for_status()
        with open(pdf_path, 'wb') as f:
            f.write(pdf_res.content)
            
        indicators = extract_data_from_pdf(pdf_path)
        
        date_match = re.search(r"(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})", title, re.I)
        report_date = date_match.group(0) if date_match else datetime.now().strftime("%B %Y")
        
        final_data = {
            "title": title,
            "date": report_date,
            "url": pdf_url,
            "scraped_at": datetime.now().isoformat(),
            **indicators
        }
        
        with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)
        print(f"✅ Data saved to {OUTPUT_JSON}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
