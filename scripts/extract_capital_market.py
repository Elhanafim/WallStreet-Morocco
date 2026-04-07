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
    # Look for "Indicateurs mensuels du marché des capitaux"
    links = soup.find_all('a', string=re.compile(r"Indicateurs mensuels du marché des capitaux", re.I))
    
    if not links:
        # Try finding links that contain the text in a span or something
        links = soup.find_all('a', href=re.compile(r"\.pdf$", re.I))
        links = [l for l in links if "Indicateurs mensuels" in l.get_text()]

    if not links:
        raise Exception("Could not find monthly indicators PDF link on the page.")

    # The first one is usually the latest
    latest_link = links[0]
    href = latest_link.get('href')
    if not href.startswith('http'):
        href = f"https://www.ammc.ma{href}"
    
    title = latest_link.get_text(strip=True)
    return title, href

def parse_number(text):
    if not text: return None
    # Remove spaces, non-breaking spaces, and handle French decimal comma
    text = text.replace('\u00a0', '').replace(' ', '').replace(',', '.')
    # Extract only numbers and dots/minuses
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
        "other_indicators": {}
    }
    
    with pdfplumber.open(pdf_path) as pdf:
        full_text = ""
        for page in pdf.pages[:2]:
            full_text += page.extract_text() + "\n"
        
        print("--- PDF TEXT START ---")
        print(full_text)
        print("--- PDF TEXT END ---")

        # 1. Market Cap (MMDhs)
        cap_match = re.search(r"Capitalisation\s*(?:\(MMDhs\))?[\s\n]+([\d\s,]+)", full_text, re.I)
        if cap_match:
            print(f"Cap match: {cap_match.group(1)}")
            data["market_cap"] = parse_number(cap_match.group(1))
        
        # 2. MASI
        masi_match = re.search(r"MASI\s+([\d\s,]{5,20})", full_text, re.I)
        if masi_match:
            print(f"MASI match: {masi_match.group(1)}")
            data["masi"] = parse_number(masi_match.group(1))
            
        # 3. Volume (MDhs)
        vol_match = re.search(r"Volume\s*(?:\(MDhs\))?[\s\n]+([\d\s,]{3,20})", full_text, re.I)
        if vol_match:
            print(f"Volume match: {vol_match.group(1)}")
            data["volume"] = parse_number(vol_match.group(1))
            
        # 4. Number of transactions (if available, sometimes it's in a table further down)
        trans_match = re.search(r"Nombre\s+de\s+transactions\s*[:]?\s*([\d\s,.]+)", full_text, re.I)
        if trans_match:
            data["transactions"] = int(parse_number(trans_match.group(1)) or 0)

    return data

def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    try:
        title, pdf_url = get_latest_pdf_url()
        print(f"Latest PDF found: {title}")
        print(f"URL: {pdf_url}")
        
        # Download PDF
        pdf_path = DATA_DIR / "latest_ammc_indicators.pdf"
        print(f"Downloading to {pdf_path}...")
        pdf_res = requests.get(pdf_url, timeout=30)
        pdf_res.raise_for_status()
        with open(pdf_path, 'wb') as f:
            f.write(pdf_res.content)
            
        # Parse PDF
        indicators = extract_data_from_pdf(pdf_path)
        
        # Extract date from title (e.g., "Janvier 2026")
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
            
        print(f"✅ Success! Data saved to {OUTPUT_JSON}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        # Save an error state so the UI can show it
        error_data = {"error": str(e), "scraped_at": datetime.now().isoformat()}
        with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
            json.dump(error_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
