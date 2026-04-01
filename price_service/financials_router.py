import asyncio
import logging
from fastapi import APIRouter, HTTPException
from financials_fetcher import fetch_financial_data
from price_cache import PriceCache
from security.sanitizer import sanitize_ticker

router = APIRouter(prefix="/api/financials", tags=["Financials"])
financials_cache = PriceCache(ttl_seconds=3600)  # 1 hour cache
log = logging.getLogger("bvc-financials-router")

@router.get("")
def get_financials(ticker: str):
    t = sanitize_ticker(ticker)
    if not t:
        raise HTTPException(status_code=400, detail="Invalid ticker")
        
    hit = financials_cache.get(f"FIN:{t}")
    if hit:
        return hit

    try:
        data = fetch_financial_data(t)
        financials_cache.set(f"FIN:{t}", data)
        return data
    except Exception as e:
        log.error(f"Failed to fetch financials for {t}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching financial data")

async def refresh_financials_background():
    import traceback
    from ticker_map import ALL_BVC_TICKERS
    while True:
        try:
            log.info("Starting background refresh of financials...")
            for t in ALL_BVC_TICKERS.keys():
                try:
                    data = await asyncio.to_thread(fetch_financial_data, t)
                    financials_cache.set(f"FIN:{t}", data)
                except Exception as e:
                    log.warning(f"Error refreshing {t}: {e}")
                await asyncio.sleep(2) # rate limit requests to BVC
            log.info("Finished background financials refresh. Sleeping for 1 hour.")
            await asyncio.sleep(3600) # Wait an hour
        except asyncio.CancelledError:
            break
        except Exception as e:
            log.error(f"Background financials refresh error: {e}")
            log.error(traceback.format_exc())
            await asyncio.sleep(60)

def start_financials_refresh():
    return asyncio.create_task(refresh_financials_background())
