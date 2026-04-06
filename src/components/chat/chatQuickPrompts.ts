/**
 * Dynamic, page-aware quick prompt suggestions for the chatbot.
 * Prompts change based on the current page to be maximally relevant.
 */

const PROMPTS_BY_PAGE: Record<string, string[]> = {
  "/terminal": [
    "Comment lire le Fear & Greed Index ?",
    "À quoi sert la barre CMD ?",
    "Explique-moi le panneau Aperçu de Marché",
    "Comment fonctionne la carte de chaleur MAP ?",
  ],
  "/market": [
    "Explique les mouvements du marché aujourd'hui",
    "Comment fonctionne une séance BVC ?",
    "C'est quoi le volume d'échanges ?",
    "Quels secteurs performent le mieux cette année ?",
  ],
  "/portfolio": [
    "Comment calculer mon rendement annualisé ?",
    "Comment fonctionne le prix auto-rempli ?",
    "C'est quoi la diversification sectorielle ?",
    "Comment sont calculés mes gains/pertes ?",
  ],
  "/simulator": [
    "Comment simuler une stratégie DCA à la BVC ?",
    "C'est quoi un portefeuille équilibré ?",
    "Comment évaluer le risque d'un portefeuille ?",
    "Quelle différence entre DCA et investissement en une seule fois ?",
  ],
  "/opcvm": [
    "Différence entre OPCVM Actions et Obligataire ?",
    "Comment lire la colonne VL ?",
    "Comment investir dans un OPCVM au Maroc ?",
    "C'est quoi l'encours d'un fonds ?",
  ],
  "/calendar": [
    "Quel impact ont les résultats S1 sur le cours ?",
    "C'est quoi une AGO et pourquoi c'est important ?",
    "Comment fonctionnent les dividendes à la BVC ?",
    "Qu'est-ce qu'une décision BAM ?",
  ],
  "/learn": [
    "Par où commencer pour apprendre la bourse ?",
    "C'est quoi un PER et comment l'utiliser ?",
    "Explique-moi l'analyse technique vs fondamentale",
    "Comment lire un bilan comptable ?",
  ],
  "/dashboard": [
    "Comment interpréter mes gains/pertes ?",
    "Qu'est-ce que la répartition sectorielle ?",
    "Comment améliorer la diversification de mon portefeuille ?",
    "C'est quoi le drawdown maximal ?",
  ],
  "/about": [
    "C'est quoi la stratégie DCA sur la BVC ?",
    "Pourquoi investir dans des valeurs minières marocaines ?",
    "Comment suivre une stratégie long terme à la BVC ?",
    "Quel est le rendement historique de la BVC ?",
  ],
  "/donate": [
    "WallStreet Morocco est-il vraiment gratuit ?",
    "Comment soutenir WallStreet Morocco ?",
    "Quelles fonctionnalités sont disponibles gratuitement ?",
    "Qu'est-ce que WallStreet Morocco ?",
  ],
  "/": [
    "Comment débuter à la Bourse de Casablanca ?",
    "Explique-moi le MASI en 2 minutes",
    "Quelles fonctionnalités propose ce site ?",
    "C'est quoi un OPCVM ?",
  ],
};

/**
 * Returns 4 relevant quick prompts for the given page.
 * Matches by prefix so /portfolio/detail → /portfolio prompts.
 */
export function getQuickPrompts(page: string): string[] {
  // Exact match first
  if (PROMPTS_BY_PAGE[page]) return PROMPTS_BY_PAGE[page];

  // Prefix match (e.g. /terminal/map → /terminal)
  const match = Object.keys(PROMPTS_BY_PAGE)
    .filter((k) => k !== "/" && page.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];

  return PROMPTS_BY_PAGE[match || "/"];
}
