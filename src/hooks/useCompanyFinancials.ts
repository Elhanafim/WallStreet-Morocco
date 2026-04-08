'use client';

/**
 * useCompanyFinancials
 *
 * Fetches the raw AMMC annual-report JSON for a BVC ticker and returns a
 * normalized ParsedAmmcReport.  Data is served statically from
 * /public/data/ammc-reports/ so no backend round-trip is needed.
 */

import { useState, useEffect, useCallback } from 'react';
import type { RawAmmcReport } from '@/types/ammc-raw';
import { parseAmmcReport, type ParsedAmmcReport } from '@/lib/data/parseAmmcReport';
import { getAmmcReportUrl, AMMC_COVERED_TICKERS } from '@/lib/data/ammcReportsMap';

type Status = 'idle' | 'loading' | 'success' | 'no-data' | 'error';

interface UseCompanyFinancialsResult {
  report:    ParsedAmmcReport | null;
  status:    Status;
  covered:   boolean;   // true when a JSON file exists for this ticker
  refetch:   () => void;
}

export function useCompanyFinancials(ticker: string | null): UseCompanyFinancialsResult {
  const [report, setReport] = useState<ParsedAmmcReport | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const covered = ticker != null && AMMC_COVERED_TICKERS.has(ticker.toUpperCase());

  const fetch_ = useCallback(async (t: string) => {
    const url = getAmmcReportUrl(t);
    if (!url) { setStatus('no-data'); setReport(null); return; }

    setStatus('loading');
    try {
      const res = await fetch(url, { next: { revalidate: 86_400 } } as RequestInit);
      if (!res.ok) { setStatus('no-data'); setReport(null); return; }
      const raw = await res.json() as RawAmmcReport;
      setReport(parseAmmcReport(raw));
      setStatus('success');
    } catch {
      setStatus('error');
      setReport(null);
    }
  }, []);

  useEffect(() => {
    if (!ticker) { setStatus('idle'); setReport(null); return; }
    fetch_(ticker.toUpperCase());
  }, [ticker, fetch_]);

  const refetch = useCallback(() => {
    if (ticker) fetch_(ticker.toUpperCase());
  }, [ticker, fetch_]);

  return { report, status, covered, refetch };
}
