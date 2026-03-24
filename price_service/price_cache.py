from threading import Lock
from time import time
from typing import Optional, Dict


class PriceCache:
    def __init__(self, ttl_seconds: int = 60):
        self._store: Dict[str, dict] = {}
        self._lock = Lock()
        self._ttl = ttl_seconds

    def get(self, key: str) -> Optional[dict]:
        with self._lock:
            entry = self._store.get(key)
            if entry and (time() - entry["ts"]) < self._ttl:
                return entry["data"]
            return None

    def set(self, key: str, data: dict):
        with self._lock:
            self._store[key] = {"data": data, "ts": time()}

    def set_bulk(self, items: Dict[str, dict]):
        with self._lock:
            ts = time()
            for key, data in items.items():
                self._store[key] = {"data": data, "ts": ts}

    def invalidate(self, key: str):
        with self._lock:
            self._store.pop(key, None)

    def is_fresh(self, key: str) -> bool:
        with self._lock:
            entry = self._store.get(key)
            return bool(entry and (time() - entry["ts"]) < self._ttl)
