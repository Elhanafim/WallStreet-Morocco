'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Roboto_Mono } from 'next/font/google';
import { useAmmcReports } from '@/hooks/useAmmcReports';

const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });

// ── Bloomberg color tokens ───────────────────────────────────────────────────
const BB_BG     = '#040914';
const BB_CARD   = '#0B101E';
const BB_BORDER = '#1E293B';
const BB_ORANGE = '#FF8C00';
const BB_GREEN  = '#00FF7F';
const BB_CYAN   = '#00BFFF';
const BB_MUTED  = '#64748B';
const BB_WHITE  = '#E2E8F0';
const BB_YELLOW = '#FFD700';
const BB_RED    = '#FF1744';

interface CommandHistory {
  cmd: string;
  output: string | React.ReactNode;
  type: 'cmd' | 'info' | 'error' | 'success';
}

export default function AmmcAnnualReports() {
  const { data, loading, error } = useAmmcReports();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([
    { cmd: '', output: 'WELCOME TO AMMC TERMINAL — ANNUAL REPORTS ACCESS', type: 'info' },
    { cmd: '', output: 'Type "HELP" for available instructions.', type: 'info' }
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on container click
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleCommand = useCallback((cmdRaw: string) => {
    const cmd = cmdRaw.trim().toUpperCase();
    if (!cmd) return;

    const parts = cmd.split(' ');
    const action = parts[0];
    const arg = parts[1];

    let output: string | React.ReactNode = '';
    let type: CommandHistory['type'] = 'info';

    switch (action) {
      case 'HELP':
        output = (
          <div className="space-y-1">
            <p>AVAILABLE COMMANDS:</p>
            <p className="text-white">LIST          <span style={{ color: BB_MUTED }}>- Show all available annual reports</span></p>
            <p className="text-white">OPEN [YEAR]   <span style={{ color: BB_MUTED }}>- Open PDF for specific year (e.g., OPEN 2023)</span></p>
            <p className="text-white">LATEST        <span style={{ color: BB_MUTED }}>- Display summary of the latest report</span></p>
            <p className="text-white">CLEAR | CLS   <span style={{ color: BB_MUTED }}>- Clear terminal history</span></p>
          </div>
        );
        break;

      case 'LIST':
        if (!data?.reports.length) {
          output = 'NO REPORTS AVAILABLE IN SYSTEM.';
          type = 'error';
        } else {
          output = (
            <div className="space-y-1">
              {data.reports.map(r => (
                <p key={r.year}>
                  [{r.year}] {r.title} {r.year === data.reports[0].year ? <span style={{ color: BB_ORANGE }}>(LATEST)</span> : ''}
                </p>
              ))}
            </div>
          );
          type = 'success';
        }
        break;

      case 'OPEN':
        if (!arg) {
          output = 'ERROR: YEAR PARAMETER REQUIRED (E.G. OPEN 2023)';
          type = 'error';
        } else {
          const report = data?.reports.find(r => r.year.toString() === arg);
          if (report) {
            window.open(report.url, '_blank');
            output = `OPENING REPORT FOR ${arg}...`;
            type = 'success';
          } else {
            output = `ERROR: REPORT FOR YEAR ${arg} NOT FOUND.`;
            type = 'error';
          }
        }
        break;

      case 'LATEST':
        if (data?.summary) {
          output = (
            <div className="border border-dashed p-3 space-y-2" style={{ borderColor: BB_CYAN }}>
              <p className="font-bold underline" style={{ color: BB_CYAN }}>SUMMARY OF LATEST REPORT ({data.reports[0].year}):</p>
              <p>{data.summary.overview}</p>
              <ul className="list-disc list-inside">
                {data.summary.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          );
          type = 'success';
        } else {
          output = 'SUMMARY NOT GENERATED FOR LATEST REPORT.';
          type = 'error';
        }
        break;

      case 'CLEAR':
      case 'CLS':
        setHistory([]);
        return;

      default:
        output = `COMMAND NOT RECOGNIZED: ${action}. TYPE "HELP" FOR COMMAND LIST.`;
        type = 'error';
    }

    setHistory(prev => [...prev, { cmd: cmdRaw, output, type }]);
  }, [data]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: BB_BG, ...robotoMono.style }}>
        <p className="text-xs animate-pulse" style={{ color: BB_ORANGE }}>FETCHING AMMC DATA_API...</p>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col p-6 overflow-hidden select-none"
      style={{ background: BB_BG, ...robotoMono.style, color: BB_WHITE }}
      onClick={handleContainerClick}
    >
      {/* Header Stat Strip */}
      <div className="flex items-center gap-4 mb-6 border-b pb-4 text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: BB_BORDER }}>
        <span style={{ color: BB_ORANGE }}>📄 AMMC REPORTS HUB</span>
        <span style={{ color: BB_BORDER }}>│</span>
        <span>REPORTS: {data?.reports.length || 0}</span>
        <span style={{ color: BB_BORDER }}>│</span>
        <span>LATEST: {data?.reports[0]?.year || 'N/A'}</span>
        <span style={{ color: BB_BORDER }}>│</span>
        <span style={{ color: '#00FF00' }}>ONLINE</span>
        <span className="ml-auto" style={{ color: BB_MUTED }}>Updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : 'N/A'}</span>
      </div>

      {/* Terminal Output */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {history.map((h, i) => (
          <div key={i} className="space-y-1">
            {h.cmd && (
              <div className="flex gap-2 text-xs">
                <span style={{ color: BB_GREEN }}>$</span>
                <span className="font-bold">{h.cmd}</span>
              </div>
            )}
            <div 
              className="text-[11px] leading-relaxed"
              style={{ 
                color: h.type === 'error' ? BB_RED : h.type === 'success' ? BB_CYAN : BB_WHITE 
              }}
            >
              {h.output}
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <div className="flex items-center gap-2 text-xs border-t pt-4" style={{ borderColor: BB_BORDER }}>
        <span style={{ color: BB_GREEN }}>{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none font-bold"
          placeholder="ENTER COMMAND..."
          style={{ color: BB_WHITE }}
        />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${BB_BORDER};
        }
      `}</style>
    </div>
  );
}
