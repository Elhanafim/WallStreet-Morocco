import { useState, useCallback, useEffect } from 'react';
import type { AmmcReportsData } from '@/lib/ammcReports';

export function useAmmcReports() {
  const [data, setData] = useState<AmmcReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/ammc-reports');
      if (!res.ok) throw new Error('Failed to fetch reports');
      const jsonData = await res.json() as AmmcReportsData;
      setData(jsonData);
    } catch (e) {
      console.error('Hook error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, load };
}
