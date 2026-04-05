"use client";

interface QuickPromptsProps {
  currentPage: string;
  onSelect: (prompt: string) => void;
  hidden?: boolean;
}

// ── Comprehensive question library, grouped by category ──────────────────────

const PROMPTS_BY_PAGE: Record<string, string[]> = {
  "/": [
    "Comment fonctionne la Bourse de Casablanca ?",
    "Qu'est-ce que le MASI ?",
    "Par où commencer pour investir en bourse au Maroc ?",
  ],
  "/market": [
    "Comment est calculé le MASI ?",
    "Quelles sont les valeurs les plus liquides de la BVC ?",
    "Comment lire un cours boursier ?",
  ],
  "/terminal": [
    "Comment analyser une action marocaine ?",
    "Comment lire les résultats financiers d'une société BVC ?",
    "Qu'est-ce que le P/E ratio ?",
  ],
  "/calendar": [
    "Comment le taux directeur BAM influence la bourse ?",
    "Comment lire un rapport HCP sur l'inflation ?",
    "Quel est l'impact du dollar sur les entreprises marocaines ?",
  ],
  "/portfolio": [
    "C'est quoi la stratégie DCA ?",
    "Comment calculer ma performance ?",
    "Comment diversifier un portefeuille BVC ?",
  ],
  "/simulator": [
    "Comment simuler une stratégie DCA ?",
    "C'est quoi un portefeuille équilibré ?",
    "Comment réduire le risque dans un portefeuille ?",
  ],
  "/learn": [
    "Par où commencer pour investir à la BVC ?",
    "C'est quoi la stratégie DCA ?",
    "Comment lire un bilan comptable ?",
  ],
  "/opcvm": [
    "Quelle différence entre un OPCVM actions et obligataire ?",
    "Comment choisir un OPCVM au Maroc ?",
    "Qu'est-ce que la VL d'un fonds ?",
  ],
  "/dashboard": [
    "Comment interpréter mes gains/pertes ?",
    "Qu'est-ce que la répartition sectorielle ?",
    "Comment diversifier mon portefeuille BVC ?",
  ],
  "/donate": [
    "Le site est-il vraiment gratuit ?",
    "Qu'est-ce que WallStreet Morocco ?",
    "Comment soutenir WallStreet Morocco ?",
  ],
};

// Fallback global suggestions shown when no page-specific match
const GLOBAL_PROMPTS = [
  "Comment fonctionne la BVC ?",
  "Qu'est-ce que le MASI ?",
  "Comment lire les résultats financiers d'ATW ?",
  "Expliquez-moi les OPCVM",
  "Quel est l'impact du taux directeur BAM sur les actions ?",
  "Comment analyser une action marocaine ?",
];

function getPrompts(page: string): string[] {
  if (PROMPTS_BY_PAGE[page]) return PROMPTS_BY_PAGE[page];
  for (const key of Object.keys(PROMPTS_BY_PAGE)) {
    if (key !== "/" && page.startsWith(key)) return PROMPTS_BY_PAGE[key];
  }
  return GLOBAL_PROMPTS.slice(0, 3);
}

export default function QuickPrompts({ currentPage, onSelect, hidden }: QuickPromptsProps) {
  if (hidden) return null;

  const prompts = getPrompts(currentPage);

  return (
    <div className="px-3 pb-2 flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        Suggestions
      </p>
      {prompts.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className="text-left text-xs bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 rounded-lg px-3 py-1.5 transition truncate"
          style={{ color: "#1d4ed8" }}
          title={p}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
