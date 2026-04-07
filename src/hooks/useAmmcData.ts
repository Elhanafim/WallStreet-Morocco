import { useState, useCallback, useEffect } from 'react';
import type { AmmcSnapshot } from '@/app/api/opcvm/ammc/route';

export function useAmmcData() {
  const [latest, setLatest] = useState<AmmcSnapshot | null>(null);
  const [history, setHistory] = useState<AmmcSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [latestRes, histRes] = await Promise.all([
        fetch('/api/opcvm/ammc'),
        fetch('/api/opcvm/ammc?_path=history'),
      ]);
      if (!latestRes.ok) throw new Error('latest failed');
      const latestData = await latestRes.json() as AmmcSnapshot;
      setLatest(latestData);
      
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData.history ?? []);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { latest, history, loading, error, load };
}
