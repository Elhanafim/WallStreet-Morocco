"""
Excel fallback for BVC price data.
Activated automatically when StocksMA direct API calls fail.

Flow:
  1. Background scheduler calls refresh_excel_prices() every 60s with
     whatever price data was successfully fetched (from casabourse or StocksMA)
  2. refresh_excel_prices() writes to bvc_prices.xlsx
  3. FastAPI endpoints read from Excel as a persistent fallback cache
  4. Frontend receives prices transparently — only the source label changes

The Excel file is useful as:
  - A persistent cache that survives service restarts
  - A downloadable snapshot for offline analysis
  - A debugging tool to inspect the last known market state
"""

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

EXCEL_PATH = Path(__file__).parent / "bvc_prices.xlsx"
EXCEL_SHEET = "BVC_PRICES"
_LAST_REFRESH: Optional[datetime] = None
_LAST_ROW_COUNT: int = 0

try:
    import pandas as pd
    import openpyxl  # noqa: F401 (imported for availability check)
    EXCEL_AVAILABLE = True
except ImportError as e:
    pd = None  # type: ignore
    EXCEL_AVAILABLE = False
    logger.warning("Excel fallback unavailable (missing pandas/openpyxl): %s", e)


# ── Write ──────────────────────────────────────────────────────────────────────

def refresh_excel_prices(prices_dict: dict) -> bool:
    """
    Write a prices dict to bvc_prices.xlsx.
    Called by the background scheduler with data from any successful source.

    prices_dict format: { "ATW": PriceResult, "BCP": PriceResult, ... }
    Returns True on success, False on failure.
    """
    global _LAST_REFRESH, _LAST_ROW_COUNT

    if not EXCEL_AVAILABLE or pd is None:
        return False

    if not prices_dict:
        logger.warning("Excel refresh: no data to write")
        return False

    try:
        rows = []
        now = datetime.now(timezone.utc).isoformat()

        for ticker, data in prices_dict.items():
            rows.append({
                "Ticker":       ticker,
                "Name":         data.get("name", ""),
                "Last Price":   data.get("lastPrice", 0) or 0,
                "Change %":     data.get("changePercent", 0) or 0,
                "Volume":       data.get("volume", 0) or 0,
                "Open":         data.get("open", 0) or 0,
                "High":         data.get("high", 0) or 0,
                "Low":          data.get("low", 0) or 0,
                "Reference":    data.get("referencePrice", 0) or 0,
                "Source":       data.get("source", "unknown"),
                "Last Updated": data.get("timestamp", now),
            })

        df = pd.DataFrame(rows)

        with pd.ExcelWriter(EXCEL_PATH, engine="openpyxl", mode="w") as writer:
            df.to_excel(writer, sheet_name=EXCEL_SHEET, index=False)

            # Auto-fit column widths
            ws = writer.sheets[EXCEL_SHEET]
            for col in ws.columns:
                max_len = max(len(str(cell.value or "")) for cell in col)
                ws.column_dimensions[col[0].column_letter].width = min(max_len + 2, 40)

        _LAST_REFRESH = datetime.now(timezone.utc)
        _LAST_ROW_COUNT = len(rows)
        logger.info("Excel refreshed: %d stocks → %s", len(rows), EXCEL_PATH.name)
        return True

    except Exception as e:
        logger.error("Excel write failed: %s", e)
        return False


# ── Read ───────────────────────────────────────────────────────────────────────

def read_excel_price(ticker: str) -> Optional[dict]:
    """Read a single ticker's price from the Excel file."""
    all_prices = read_excel_all_prices()
    clean = ticker.upper().replace("CSEMA:", "").strip()
    return all_prices.get(clean)


def read_excel_all_prices() -> dict[str, dict]:
    """
    Read all prices from the Excel file.
    Returns dict: { "ATW": PriceResult, ... }
    Returns {} if file doesn't exist or read fails.
    """
    if not EXCEL_AVAILABLE or pd is None:
        return {}

    if not EXCEL_PATH.exists():
        logger.debug("Excel file not found: %s", EXCEL_PATH)
        return {}

    try:
        df = pd.read_excel(EXCEL_PATH, sheet_name=EXCEL_SHEET)
        result: dict[str, dict] = {}

        for _, row in df.iterrows():
            ticker = str(row.get("Ticker", "")).strip().upper()
            if not ticker:
                continue

            last_price = float(row.get("Last Price", 0) or 0)
            if last_price <= 0:
                continue

            result[ticker] = {
                "ticker":         ticker,
                "name":           str(row.get("Name", ticker)),
                "lastPrice":      last_price,
                "changePercent":  float(row.get("Change %", 0) or 0),
                "change":         float(row.get("Change %", 0) or 0),
                "volume":         int(row.get("Volume", 0) or 0),
                "open":           float(row.get("Open", 0) or 0),
                "high":           float(row.get("High", 0) or 0),
                "low":            float(row.get("Low", 0) or 0),
                "referencePrice": float(row.get("Reference", 0) or 0),
                "source":         "StocksMA-Excel",
                "timestamp":      str(row.get("Last Updated", "")),
                "available":      True,
                "cached":         True,
            }

        return result

    except Exception as e:
        logger.error("Excel read failed: %s", e)
        return {}


# ── Status & download ──────────────────────────────────────────────────────────

def get_excel_status() -> dict:
    """Return metadata about the Excel file state."""
    exists = EXCEL_PATH.exists()
    return {
        "available":    EXCEL_AVAILABLE,
        "exists":       exists,
        "path":         str(EXCEL_PATH),
        "lastRefresh":  _LAST_REFRESH.isoformat() if _LAST_REFRESH else None,
        "rowCount":     _LAST_ROW_COUNT,
        "sizeBytes":    EXCEL_PATH.stat().st_size if exists else 0,
    }


def get_excel_path() -> Optional[Path]:
    """Return the Excel file path if it exists, else None."""
    return EXCEL_PATH if EXCEL_PATH.exists() else None
