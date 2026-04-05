/**
 * Dynamic, page-aware quick prompt suggestions for the chatbot.
 * Prompts change based on the current page to be maximally relevant.
 */

const PROMPTS_BY_PAGE: Record<string, string[]> = {
  "/terminal": [
    "Comment lire le Fear & Greed Index ?",
    "Explique-moi la différence MASI / MADEX",
    "Comment interpréter le volume d'une séance ?",
    "Qu'est-ce qu'un signal HAUSSIER vs BAISSIER ?",
  ],
  "/market": [
    "Quels secteurs performent le mieux cette année ?",
    "Comment fonctionne une séance de bourse à Casablanca ?",
    "C'est quoi le fixing à la BVC ?",
    "Comment lire une variation en pourcentage ?",
  ],
  "/portfolio": [
    "Comment calculer mon rendement annualisé ?",
    "Qu'est-ce que la diversification sectorielle ?",
    "Explique-moi le ratio de Sharpe",
    "Comment fonctionne l'imposition des plus-values au Maroc ?",
  ],
  "/simulator": [
    "Comment simuler une stratégie DCA à la BVC ?",
    "C'est quoi un portefeuille équilibré ?",
    "Comment évaluer le risque d'un portefeuille ?",
    "Quelle différence entre DCA et investissement en une seule fois ?",
  ],
  "/opcvm": [
    "Quelle différence entre un OPCVM Actions et Obligataire ?",
    "Comment les OPCVM marocains sont-ils taxés ?",
    "À partir de combien peut-on investir dans un OPCVM ?",
    "Comment choisir un OPCVM selon mon profil de risque ?",
  ],
  "/calendar": [
    "Quel est l'impact des résultats semestriels sur le cours ?",
    "C'est quoi une AGO et pourquoi c'est important ?",
    "Comment fonctionnent les dividendes à la BVC ?",
    "Quel impact a le taux directeur BAM sur les marchés ?",
  ],
  "/learn": [
    "Par où commencer pour investir à la BVC ?",
    "C'est quoi la stratégie DCA ?",
    "Comment lire un bilan comptable ?",
    "Explique-moi l'analyse fondamentale",
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
    "Comment débuter en bourse au Maroc ?",
    "Explique-moi le MASI en 2 minutes",
    "Quelles sociétés sont cotées à Casablanca ?",
    "C'est quoi un OPCVM ?",
  ],
};

/**
 * Returns 4 relevant quick prompts for the given page.
 * Matches by prefix so /portfolio/123 → /portfolio prompts.
 */
export function getQuickPrompts(page: string): string[] {
  // Exact match first
  if (PROMPTS_BY_PAGE[page]) return PROMPTS_BY_PAGE[page];

  // Prefix match (e.g. /portfolio/detail → /portfolio)
  for (const key of Object.keys(PROMPTS_BY_PAGE)) {
    if (key !== "/" && page.startsWith(key)) return PROMPTS_BY_PAGE[key];
  }

  // Fallback to homepage prompts
  return PROMPTS_BY_PAGE["/"];
}
