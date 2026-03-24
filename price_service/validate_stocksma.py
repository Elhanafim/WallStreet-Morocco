"""
StocksMA validation script.
Run: python3 price_service/validate_stocksma.py
"""
import sys


def validate():
    print("Testing StocksMA installation...")

    try:
        import StocksMA as sm
        print("✓ StocksMA imported successfully")
    except ImportError as e:
        print(f"✗ StocksMA import failed: {e}")
        sys.exit(1)

    # Test 1: Market status
    try:
        market = sm.get_market_status()
        print(f"✓ Market status: {market}")
    except Exception as e:
        print(f"⚠ Market status failed: {e}")

    # Test 2: Single stock price
    try:
        data = sm.get_stock_info("ATW")
        print(f"✓ ATW data: {data}")
    except Exception as e:
        print(f"⚠ Single stock failed: {e}")

    # Test 3: All stocks snapshot
    try:
        all_stocks = sm.get_all_stocks()
        count = len(all_stocks) if all_stocks is not None else 0
        print(f"✓ All stocks: {count} items")
        if count > 0:
            first = all_stocks[0] if isinstance(all_stocks, list) else list(all_stocks.values())[0]
            print(f"  First item type: {type(first)} | keys/attrs: "
                  f"{list(first.keys()) if isinstance(first, dict) else dir(first)[:8]}")
    except Exception as e:
        print(f"⚠ All stocks failed: {e}")

    # Test 4: Historical data
    try:
        hist = sm.get_stock_historical_data("ATW")
        count = len(hist) if hist is not None else 0
        print(f"✓ Historical data: {count} rows")
        if count > 0:
            first = hist[0] if isinstance(hist, list) else hist.iloc[0].to_dict() if hasattr(hist, 'iloc') else {}
            print(f"  First row keys: {list(first.keys()) if isinstance(first, dict) else []}")
    except Exception as e:
        print(f"⚠ Historical data failed: {e}")

    # Test 5: Session top performers
    try:
        top = sm.get_session_top_performers()
        print(f"✓ Top performers: {type(top)} len={len(top) if top else 0}")
    except Exception as e:
        print(f"⚠ Top performers failed: {e}")

    # Test 6: List all available functions
    print("\nAvailable StocksMA functions:")
    funcs = [f for f in dir(sm) if not f.startswith('_') and callable(getattr(sm, f))]
    for f in funcs:
        print(f"  - sm.{f}()")

    print("\nValidation complete.")


if __name__ == "__main__":
    validate()
