"use client";

import { useTranslation } from "react-i18next";

interface QuickPromptsProps {
  currentPage: string;
  onSelect: (prompt: string) => void;
  hidden?: boolean;
}

const PROMPTS: Record<string, string[]> = {
  "/": [
    "Comment fonctionne la Bourse de Casablanca ?",
    "Quels indices suivre au Maroc ?",
    "Comment créer un compte gratuit ?",
  ],
  "/market": [
    "Qu'est-ce que le MASI ?",
    "Comment lire un cours boursier ?",
    "Quelles sont les meilleures hausses du jour ?",
  ],
  "/calendar": [
    "Qu'est-ce qu'un événement macro ?",
    "Comment Bank Al-Maghrib influence les marchés ?",
    "Que signifie un impact 5 étoiles ?",
  ],
  "/portfolio": [
    "Comment ajouter une action à mon portefeuille ?",
    "Comment calculer ma performance ?",
    "Qu'est-ce que le DCA ?",
  ],
  "/dashboard": [
    "Comment interpréter mes gains/pertes ?",
    "Qu'est-ce que la répartition sectorielle ?",
    "Comment diversifier mon portefeuille BVC ?",
  ],
  "/learn": [
    "Par où commencer pour investir à la BVC ?",
    "Qu'est-ce qu'une OPCVM ?",
    "Quelle est la différence entre MASI et MSI20 ?",
  ],
  "/about": [
    "Quelle est la stratégie DCA présentée sur ce site ?",
    "Comment contacter l'équipe ?",
    "Qu'est-ce que WallStreet Morocco ?",
  ],
  "/donate": [
    "Comment soutenir WallStreet Morocco ?",
    "Le site est-il vraiment gratuit ?",
    "Quels moyens de paiement acceptés ?",
  ],
  "/opcvm": [
    "Qu'est-ce qu'un OPCVM marocain ?",
    "Quelle est la différence entre OPCVM actions et obligataire ?",
    "Comment investir dans un OPCVM au Maroc ?",
  ],
  "/simulator": [
    "Comment utiliser le simulateur ?",
    "Puis-je simuler sans créer un compte ?",
    "Qu'est-ce qu'une simulation de portefeuille ?",
  ],
};

function getPrompts(page: string): string[] {
  if (PROMPTS[page]) return PROMPTS[page].slice(0, 3);
  // Match prefix (e.g. /learn/slug → /learn)
  for (const key of Object.keys(PROMPTS)) {
    if (key !== "/" && page.startsWith(key)) return PROMPTS[key].slice(0, 3);
  }
  return PROMPTS["/"].slice(0, 3);
}

export default function QuickPrompts({ currentPage, onSelect, hidden }: QuickPromptsProps) {
  const { t } = useTranslation("chat");
  if (hidden) return null;

  const prompts = getPrompts(currentPage);

  return (
    <div className="px-3 pb-2 flex flex-col gap-1.5">
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {t("quickPromptsLabel", "Suggestions :")}
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
