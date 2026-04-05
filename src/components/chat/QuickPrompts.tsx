"use client";

import { getQuickPrompts } from "./chatQuickPrompts";

interface QuickPromptsProps {
  currentPage: string;
  onSelect: (prompt: string) => void;
  hidden?: boolean;
}

export default function QuickPrompts({ currentPage, onSelect, hidden }: QuickPromptsProps) {
  if (hidden) return null;

  const prompts = getQuickPrompts(currentPage);

  return (
    <div className="px-3 pb-2 flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        Suggestions
      </p>
      {prompts.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className="text-left text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5 transition truncate"
          title={p}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
