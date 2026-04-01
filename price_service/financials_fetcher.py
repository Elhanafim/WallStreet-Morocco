import logging
import bvc
from ticker_map import get_company_name

log = logging.getLogger("bvc-financials")

def num(v) -> float | None:
    if v is None or v == "" or v == "N/A" or str(v).strip() == "-":
        return None
    try:
        if isinstance(v, str):
            clean = v.replace(" ", "").replace(",", ".")
            return float(clean)
        return float(v)
    except (ValueError, TypeError):
        return None

def fetch_financial_data(ticker: str) -> dict:
    """Fetch and normalize financial data for a single ticker via BVCscrap."""
    name = get_company_name(ticker)
    
    # Defaults
    data = {
        "ticker": ticker.upper(),
        "sector": None,
        "currentPrice": None,
        "performance": None,
        "marketCap": None,
        "peRatio": None,
        "avgVolume30d": None,
        "ytdChange": None,
        "estimatedRevenue": None,
        "estimatedNetIncome": None,
        "indicators": [
            {"name": "Chiffre d'affaires", "value": None, "trend": None},
            {"name": "EBITDA", "value": None, "trend": None},
            {"name": "Résultat net", "value": None, "trend": None},
            {"name": "Actifs totaux", "value": None, "trend": None},
            {"name": "Capitaux propres", "value": None, "trend": None},
        ]
    }
    
    try:
        cours = bvc.getCours(name)
        if hasattr(cours, "to_dict"):
            cours = cours.to_dict("records")[0] if len(cours) > 0 else cours

        if isinstance(cours, dict):
            def _get(*keys):
                for k in keys:
                    if k in cours: return cours[k]
                    for ck, cv in cours.items():
                        if ck.lower() == k.lower(): return cv
                return None
                
            data["currentPrice"] = num(_get("Cours", "lastPrice", "price"))
            data["performance"] = num(_get("Variation", "change", "performance"))
            data["marketCap"] = num(_get("Capitalisation", "marketCap", "Capitalisation boursière"))
            data["avgVolume30d"] = num(_get("Volume", "volume_moyen"))
            data["ytdChange"] = num(_get("Variation_YTD", "YTD", "ytdChange"))
            data["sector"] = _get("Secteur", "sector")
    except Exception as e:
        log.warning(f"Error fetching cours for {ticker}: {e}")
        
    try:
        inds = bvc.getKeyIndicators(name)
        if hasattr(inds, 'to_dict'):
            inds = inds.to_dict('records')
            
        if isinstance(inds, list) and len(inds) > 0:
            latest = inds[0] if isinstance(inds[0], dict) else {}
            previous = inds[1] if len(inds) > 1 and isinstance(inds[1], dict) else {}
            
            def get_val(item, *keys):
                for k in keys:
                    if k in item: return num(item[k])
                    for ck, cv in item.items():
                        if k.lower() in ck.lower():
                            return num(cv)
                return None
                
            def compute_trend(current, prev):
                if current and prev and prev != 0:
                    return ((current - prev) / abs(prev)) * 100
                return None
            
            ca_val = get_val(latest, "Chiffre d'affaires", "CA", "Revenue")
            ca_prev = get_val(previous, "Chiffre d'affaires", "CA")
            ebitda_val = get_val(latest, "EBITDA", "EBE", "Excédent")
            ebitda_prev = get_val(previous, "EBITDA", "EBE")
            net_val = get_val(latest, "Résultat net", "Net Income", "RN")
            net_prev = get_val(previous, "Résultat net", "Net Income")
            assets_val = get_val(latest, "Actifs totaux", "Total Assets", "Total Bilan")
            assets_prev = get_val(previous, "Actifs totaux", "Total Assets")
            equity_val = get_val(latest, "Capitaux propres", "Fonds Propres", "Equity")
            equity_prev = get_val(previous, "Capitaux propres", "Fonds Propres")

            data["indicators"] = [
                {"name": "Chiffre d'affaires", "value": ca_val, "trend": compute_trend(ca_val, ca_prev)},
                {"name": "EBITDA", "value": ebitda_val, "trend": compute_trend(ebitda_val, ebitda_prev)},
                {"name": "Résultat net", "value": net_val, "trend": compute_trend(net_val, net_prev)},
                {"name": "Actifs totaux", "value": assets_val, "trend": compute_trend(assets_val, assets_prev)},
                {"name": "Capitaux propres", "value": equity_val, "trend": compute_trend(equity_val, equity_prev)},
            ]
            
            data["estimatedRevenue"] = ca_val
            data["estimatedNetIncome"] = net_val
            
    except Exception as e:
        log.warning(f"Error fetching indicators for {ticker}: {e}")

    return data
