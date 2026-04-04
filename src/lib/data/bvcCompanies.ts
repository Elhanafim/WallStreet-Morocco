/**
 * BVC Company master data — sourced from iamleblanc/StocksMA (github.com/iamleblanc/StocksMA)
 * Contains: full name, ISIN (Medias24 / AMMC format), BVC sector, short description
 */

export interface BVCCompany {
  name: string;
  isin: string;
  sector: string;
  desc: string;
}

export const BVC_COMPANIES: Record<string, BVCCompany> = {
  // ── Banques ──────────────────────────────────────────────────────────────────
  ATW: {
    name: 'Attijariwafa Bank S.A.',
    isin: 'MA0000012445',
    sector: 'Banques',
    desc: "Première banque du Maroc par le total bilan. Présente dans 28 pays africains, elle offre des services bancaires, d'assurance et de gestion d'actifs. Filiale du groupe Al Mada.",
  },
  BCP: {
    name: 'Banque Centrale Populaire S.A.',
    isin: 'MA0000011884',
    sector: 'Banques',
    desc: "Tête de groupe du Crédit Populaire du Maroc. Banque de détail et corporate avec un réseau de plus de 1 700 agences et 4 millions de clients.",
  },
  BOA: {
    name: 'Bank of Africa S.A.',
    isin: 'MA0000012437',
    sector: 'Banques',
    desc: "Banque panafricaine présente dans 18 pays africains. Anciennement BMCE Bank of Africa. Actionnaire de référence : Groupe RMA.",
  },
  BCI: {
    name: "Banque Marocaine pour le Commerce et l'Industrie",
    isin: 'MA0000010811',
    sector: 'Banques',
    desc: "Filiale à 66,7 % de BNP Paribas au Maroc. Réseau de 350+ agences, actif dans la banque de détail et corporate.",
  },
  CDM: {
    name: 'Crédit du Maroc S.A.',
    isin: 'MA0000010381',
    sector: 'Banques',
    desc: "Banque filiale du Crédit Agricole (France). Réseau de 360 agences, active dans les segments particuliers, professionnels et entreprises.",
  },
  CIH: {
    name: 'Crédit Immobilier et Hôtelier S.A.',
    isin: 'MA0000011454',
    sector: 'Banques',
    desc: "Banque universelle, spécialisée à l'origine dans l'immobilier et l'hôtellerie. Actionnaire principal : CDG. Réseau de 200+ agences.",
  },

  // ── Assurances ───────────────────────────────────────────────────────────────
  WAA: {
    name: 'Wafa Assurance S.A.',
    isin: 'MA0000010928',
    sector: 'Assurances',
    desc: "Première compagnie d'assurance du Maroc par le chiffre d'affaires. Filiale d'Attijariwafa Bank, active en assurance vie et non-vie.",
  },
  ATL: {
    name: 'AtlantaSanad S.A.',
    isin: 'MA0000011710',
    sector: 'Assurances',
    desc: "Deuxième groupe d'assurance du Maroc. Issu de la fusion d'Atlanta et Sanad. Filiale du groupe FinanceCom (RMA).",
  },
  SAH: {
    name: 'Saham Assurance S.A.',
    isin: 'MA0000012007',
    sector: 'Assurances',
    desc: "Troisième assureur marocain. Filiale du groupe Sanlam (Afrique du Sud) depuis 2018. Présente dans l'assurance vie et IARD.",
  },
  AGM: {
    name: 'Agma S.A.',
    isin: 'MA0000010944',
    sector: 'Assurances',
    desc: "Courtier en assurance leader au Maroc. Gère les risques d'entreprises, institutions financières et particuliers.",
  },
  AFM: {
    name: 'AFMA S.A.',
    isin: 'MA0000012296',
    sector: 'Assurances',
    desc: "Société de courtage d'assurance cotée à la Bourse de Casablanca. Active dans l'assurance entreprises et grands risques.",
  },

  // ── Sociétés de financement ───────────────────────────────────────────────────
  EQD: {
    name: 'EQDOM S.A.',
    isin: 'MA0000010357',
    sector: 'Sociétés de financement',
    desc: "Leader du crédit à la consommation au Maroc. Filiale du groupe Société Générale Maroc et Banque Populaire.",
  },
  SLF: {
    name: 'Salafin S.A.',
    isin: 'MA0000011744',
    sector: 'Sociétés de financement',
    desc: "Société de crédit à la consommation filiale de BOA (Bank of Africa). Spécialisée dans les prêts personnels et auto.",
  },
  MAB: {
    name: 'Maghrebail S.A.',
    isin: 'MA0000011215',
    sector: 'Sociétés de financement',
    desc: "Société de leasing filiale de CIH Bank. Propose des solutions de crédit-bail mobilier et immobilier aux entreprises.",
  },
  MLE: {
    name: 'Maroc Leasing S.A.',
    isin: 'MA0000010035',
    sector: 'Sociétés de financement',
    desc: "Société de crédit-bail cotée à la BVC. Filiale d'Attijariwafa Bank, spécialisée dans le leasing d'équipements.",
  },
  DIS: {
    name: 'DIAC SALAF S.A.',
    isin: 'MA0000010639',
    sector: 'Sociétés de financement',
    desc: "Société de crédit à la consommation cotée à la BVC. Active dans le financement des particuliers et professionnels.",
  },

  // ── Télécommunications ───────────────────────────────────────────────────────
  IAM: {
    name: 'Itissalat Al-Maghrib (Maroc Telecom) S.A.',
    isin: 'MA0000011488',
    sector: 'Télécommunications',
    desc: "Opérateur télécom historique du Maroc. Présent dans 9 pays africains, leader en mobile, fixe et internet. Filiale d'Etisalat/e& (Emirates Telecom Group).",
  },

  // ── Mines ────────────────────────────────────────────────────────────────────
  MNG: {
    name: 'Managem S.A.',
    isin: 'MA0000011058',
    sector: 'Mines',
    desc: "Premier groupe minier privé marocain. Exploite des mines d'or, argent, cobalt, cuivre et zinc au Maroc et en Afrique subsaharienne. Filiale d'Al Mada.",
  },
  SMI: {
    name: "Société Métallurgique d'Imiter S.A.",
    isin: 'MA0000010068',
    sector: 'Mines',
    desc: "Producteur d'argent métal. Exploite le gisement d'Imiter (Tinghir), l'un des plus importants d'Afrique. Filiale de Managem.",
  },
  CMT: {
    name: 'Compagnie Minière de Touissit S.A.',
    isin: 'MA0000011793',
    sector: 'Mines',
    desc: "Exploitant du gisement plombifère de Touissit (Oriental). Producteur de plomb, argent et zinc. Partiellement détenu par Managem.",
  },
  ZDJ: {
    name: 'Zellidja S.A.',
    isin: 'MA0000010571',
    sector: 'Mines',
    desc: "Société minière historique, exploitante de mines de plomb et zinc. Cotée depuis les origines de la BVC. Filiale d'ONA/Al Mada.",
  },
  ALM: {
    name: 'Aluminium du Maroc S.A.',
    isin: 'MA0000010936',
    sector: 'Mines',
    desc: "Producteur de profilés en aluminium et accessoires. Sert principalement les secteurs du bâtiment et de l'automobile.",
  },

  // ── BTP & Matériaux de construction ─────────────────────────────────────────
  LHM: {
    name: 'LafargeHolcim Maroc S.A.',
    isin: 'MA0000012320',
    sector: 'BTP & Matériaux',
    desc: "Leader marocain de la production de ciment avec une capacité de 8,8 Mt/an. Filiale du groupe suisse Holcim. Première capitalisation du secteur BTP.",
  },
  CMA: {
    name: 'Les Ciments du Maroc S.A.',
    isin: 'MA0000010506',
    sector: 'BTP & Matériaux',
    desc: "Deuxième cimentier du Maroc. Capacité de 5,6 Mt/an. Filiale du groupe italien Heidelberg Materials. Sites de production à Aït Baha, Marrakech et Safi.",
  },
  JET: {
    name: 'Jet Contractors S.A.',
    isin: 'MA0000012080',
    sector: 'BTP & Matériaux',
    desc: "Entreprise de génie civil et de construction routière. Active dans les travaux d'infrastructure au Maroc.",
  },
  STR: {
    name: 'STROC Industrie S.A.',
    isin: 'MA0000012056',
    sector: 'BTP & Matériaux',
    desc: "Spécialiste en chaudronnerie industrielle et montage de structures métalliques. Intervient dans l'énergie, mines et chimie.",
  },
  TGC: {
    name: 'TGCC S.A.',
    isin: 'MA0000012528',
    sector: 'BTP & Matériaux',
    desc: "Groupe de travaux de construction (TGCC). Acteur majeur du BTP au Maroc, présent dans la construction de bâtiments et ouvrages d'art.",
  },

  // ── Immobilier ───────────────────────────────────────────────────────────────
  ADH: {
    name: 'Douja Promotion Groupe Addoha S.A.',
    isin: 'MA0000011512',
    sector: 'Immobilier',
    desc: "Premier promoteur immobilier coté à la BVC. Spécialisé dans le logement social, économique et haut standing. Présent dans 7 pays africains.",
  },
  ADI: {
    name: 'Alliances Développement Immobilier S.A.',
    isin: 'MA0000011819',
    sector: 'Immobilier',
    desc: "Promoteur immobilier marocain présent dans les segments logement et tourisme. A traversé une restructuration financière importante.",
  },
  RDS: {
    name: 'Résidences Dar Saada S.A.',
    isin: 'MA0000012239',
    sector: 'Immobilier',
    desc: "Promoteur immobilier spécialisé dans le logement intermédiaire et économique. Principaux projets dans la région de Casablanca.",
  },
  ARD: {
    name: 'Aradei Capital S.A.',
    isin: 'MA0000012460',
    sector: 'Immobilier',
    desc: "Foncière cotée (REIT) spécialisée dans les actifs commerciaux (centres commerciaux Label Vie/Carrefour). Cotée depuis 2020.",
  },
  IMO: {
    name: 'Immorente Invest S.A.',
    isin: 'MA0000012387',
    sector: 'Immobilier',
    desc: "Société d'investissement immobilier cotée. Portefeuille diversifié d'actifs tertiaires (bureaux, commerces) au Maroc.",
  },
  RIS: {
    name: 'RISMA S.A.',
    isin: 'MA0000011462',
    sector: 'Immobilier',
    desc: "Opérateur hôtelier, filiale d'Accor Maroc. Gère des hôtels sous enseignes Ibis, Novotel, Mercure et Sofitel au Maroc.",
  },
  BAL: {
    name: 'Société Immobilière Balima S.A.',
    isin: 'MA0000011991',
    sector: 'Immobilier',
    desc: "Foncière historique cotée à la BVC depuis 1960. Détient et valorise un patrimoine immobilier à usage de bureaux et commerces.",
  },

  // ── Pétrole et Gaz ───────────────────────────────────────────────────────────
  GAZ: {
    name: 'Afriquia Gaz S.A.',
    isin: 'MA0000010951',
    sector: 'Pétrole et Gaz',
    desc: "Filiale du groupe Akwa. Principal distributeur de gaz butane et propane au Maroc. Part de marché dominante dans la distribution en vrac.",
  },
  TMA: {
    name: 'TotalEnergies Marketing Maroc S.A.',
    isin: 'MA0000012262',
    sector: 'Pétrole et Gaz',
    desc: "Distributeur de produits pétroliers et de lubrifiants au Maroc. Réseau de 380+ stations-service. Filiale de TotalEnergies SE.",
  },
  SAM: {
    name: 'SAMIR S.A.',
    isin: 'MA0000010803',
    sector: 'Pétrole et Gaz',
    desc: "Unique raffinerie marocaine, en cessation d'activité depuis 2015. Ses actions restent cotées à la BVC mais suspendues.",
  },

  // ── Énergie ──────────────────────────────────────────────────────────────────
  TQM: {
    name: 'TAQA Morocco S.A.',
    isin: 'MA0000012205',
    sector: 'Énergie',
    desc: "Producteur indépendant d'énergie thermique au charbon. Exploite la centrale de Jorf Lasfar (2 056 MW), principale centrale électrique du Maroc.",
  },

  // ── Agroalimentaire ──────────────────────────────────────────────────────────
  CSR: {
    name: 'Cosumar S.A.',
    isin: 'MA0000012247',
    sector: 'Agroalimentaire',
    desc: "Principal raffineur et distributeur de sucre au Maroc. Traite 5,7 Mt de betteraves et canne par an. Filiale du groupe SNI/Al Mada.",
  },
  LES: {
    name: 'Lesieur Cristal S.A.',
    isin: 'MA0000012031',
    sector: 'Agroalimentaire',
    desc: "Leader marocain des huiles alimentaires et savons. Marques Lesieur, Cristal, Huilor. Filiale de Sofiprotéol (France).",
  },
  OUL: {
    name: 'OULMES S.A.',
    isin: 'MA0000010415',
    sector: 'Agroalimentaire',
    desc: "Embouteilleur de l'eau minérale Sidi Ali et Oulmes. Distribue également Coca-Cola, Fanta et Sprite au Maroc. Filiale du groupe ONA/Al Mada.",
  },
  SBM: {
    name: 'Société des Boissons du Maroc S.A.',
    isin: 'MA0000010365',
    sector: 'Agroalimentaire',
    desc: "Brasseur et embouteilleur de boissons alcoolisées et non-alcoolisées. Marques Flag, Casablanca, Stork. Partenaire de Heineken.",
  },
  CDA: {
    name: 'Centrale Danone S.A.',
    isin: 'MA0000012049',
    sector: 'Agroalimentaire',
    desc: "Leader laitier au Maroc. Produit sous les marques Danone, Jaouda, Yawmi. Filiale du groupe français Danone.",
  },
  CRS: {
    name: 'Cartier Saada S.A.',
    isin: 'MA0000011868',
    sector: 'Agroalimentaire',
    desc: "Producteur d'huile d'olive et de table. Traite des olives dans la région de Meknès. Présent à l'international.",
  },
  DRI: {
    name: 'DARI COUSPATE S.A.',
    isin: 'MA0000011421',
    sector: 'Agroalimentaire',
    desc: "Fabricant marocain de pâtes alimentaires, couscous et semoule. Marques Dari, Couspate. Distribué dans tout le Maroc et à l'export.",
  },
  MUT: {
    name: 'Mutandis SCA',
    isin: 'MA0000012395',
    sector: 'Agroalimentaire',
    desc: "Holding de produits de grande consommation (poissons en conserve, eau, détergents). Marques Excellia, Aïn Saïss.",
  },
  UMR: {
    name: 'UNIMER S.A.',
    isin: 'MA0000012023',
    sector: 'Agroalimentaire',
    desc: "Groupe industriel de transformation de produits de la mer (sardines, anchois). Important exportateur marocain.",
  },

  // ── Distribution ─────────────────────────────────────────────────────────────
  LBV: {
    name: 'Label Vie S.A.',
    isin: 'MA0000011801',
    sector: 'Distribution',
    desc: "Leader de la grande distribution au Maroc. Exploite les enseignes Carrefour hypermarché, Carrefour Market et BestMark (hard discount).",
  },
  ATH: {
    name: 'Auto Hall S.A.',
    isin: 'MA0000010969',
    sector: 'Distribution',
    desc: "Concessionnaire automobile historique au Maroc. Distribue Ford, Mitsubishi, Volvo trucks et buses. Réseau de 80+ points de vente.",
  },
  NEJ: {
    name: 'Auto Nejma S.A.',
    isin: 'MA0000011009',
    sector: 'Distribution',
    desc: "Importateur et distributeur exclusif de véhicules Mercedes-Benz et smart au Maroc.",
  },
  NKL: {
    name: 'Ennakl Automobiles S.A.',
    isin: 'MA0000011942',
    sector: 'Distribution',
    desc: "Distributeur automobile au Maroc, filiale du groupe Palmeraie Développement. Concessionnaire de marques premium.",
  },

  // ── Santé ────────────────────────────────────────────────────────────────────
  SOT: {
    name: 'Sothema S.A.',
    isin: 'MA0000012502',
    sector: 'Santé',
    desc: "Laboratoire pharmaceutique marocain. Produit et distribue plus de 400 spécialités. Partenaire de grands groupes pharma internationaux.",
  },
  PRO: {
    name: 'Promopharm S.A.',
    isin: 'MA0000011660',
    sector: 'Santé',
    desc: "Fabricant de médicaments génériques et OTC au Maroc. Filiale du groupe Sanofi. Distribue Doliprane, Maalox et autres marques.",
  },
  AKT: {
    name: 'AKDITAL S.A.',
    isin: 'MA0000012585',
    sector: 'Santé',
    desc: "Premier groupe hospitalier privé coté à la BVC (IPO 2022). Réseau de 30+ cliniques et hôpitaux spécialisés au Maroc.",
  },

  // ── Technologie ──────────────────────────────────────────────────────────────
  HPS: {
    name: 'Hightech Payment Systems S.A.',
    isin: 'MA0000011611',
    sector: 'Technologie',
    desc: "Éditeur mondial de logiciels de paiement électronique. Solution PowerCARD déployée dans 90+ pays et 300+ banques. Pure player tech marocain à l'international.",
  },
  S2M: {
    name: 'Société Maghrebine de Monétique S.A.',
    isin: 'MA0000012106',
    sector: 'Technologie',
    desc: "Opérateur de monétique (cartes bancaires, DAB, TPE) au Maroc. Gère le réseau interbancaire marocain CMI.",
  },
  DWY: {
    name: 'Disway S.A.',
    isin: 'MA0000011637',
    sector: 'Technologie',
    desc: "Distributeur IT au Maroc et en Afrique. Revendeur agrée de HP, Lenovo, Cisco, Microsoft, Oracle. Filiale du groupe Palmeraie.",
  },
  M2M: {
    name: 'm2m group S.A.',
    isin: 'MA0000011678',
    sector: 'Technologie',
    desc: "Spécialiste des systèmes d'identification sécurisée (cartes à puce, passeports biométriques). Actif dans 30 pays africains.",
  },
  DYT: {
    name: 'DISTY TECHNOLOGIES S.A.',
    isin: 'MA0000012536',
    sector: 'Technologie',
    desc: "Distributeur de composants électroniques et solutions IT. Cotée en 2022. Fournisseur de l'industrie et des intégrateurs système.",
  },
  INV: {
    name: 'Involys S.A.',
    isin: 'MA0000011579',
    sector: 'Technologie',
    desc: "Éditeur de logiciels de gestion (ERP, RH, finance) pour entreprises marocaines et africaines.",
  },
  IBC: {
    name: 'IB Maroc.com S.A.',
    isin: 'MA0000011132',
    sector: 'Technologie',
    desc: "Société informatique marocaine. Services de développement logiciel et d'intégration de systèmes pour entreprises.",
  },
  MIC: {
    name: 'Microdata S.A.',
    isin: 'MA0000012163',
    sector: 'Technologie',
    desc: "Distributeur de matériel informatique et de bureautique. Présent sur les marchés public et privé au Maroc.",
  },

  // ── Transport ────────────────────────────────────────────────────────────────
  MSA: {
    name: 'SODEP-Marsa Maroc S.A.',
    isin: 'MA0000012312',
    sector: 'Transport',
    desc: "Opérateur de terminaux portuaires au Maroc. Gère les ports de Casablanca, Mohammedia, Agadir et Nador. IPO 2016.",
  },
  CTM: {
    name: 'Compagnie de Transports au Maroc S.A.',
    isin: 'MA0000010340',
    sector: 'Transport',
    desc: "Leader du transport interurbain par autocar au Maroc. Réseau de lignes nationales et gares routières. Filiale du groupe ONA/Al Mada.",
  },
  TIM: {
    name: 'TIMAR S.A.',
    isin: 'MA0000011686',
    sector: 'Transport',
    desc: "Commissionnaire en douane et transitaire. Offre des solutions logistiques maritimes, aériennes et terrestres.",
  },

  // ── Industrie ────────────────────────────────────────────────────────────────
  DHO: {
    name: 'Delta Holding S.A.',
    isin: 'MA0000011850',
    sector: 'Industrie',
    desc: "Groupe industriel diversifié : environnement, BTP, industrie, services. Active dans les marchés publics et privés au Maroc.",
  },
  SID: {
    name: 'Société Nationale de Sidérurgie S.A. (Sonasid)',
    isin: 'MA0000010019',
    sector: 'Industrie',
    desc: "Sidérurgiste leader au Maroc. Produit des aciers longs pour le secteur de la construction. Filiale du groupe ArcelorMittal.",
  },
  SNA: {
    name: 'Stokvis Nord Afrique S.A.',
    isin: 'MA0000011843',
    sector: 'Industrie',
    desc: "Importateur et distributeur de matériel industriel (chariots élévateurs, outils). Représentant exclusif de marques mondiales au Maroc.",
  },
  FBR: {
    name: 'Fenie Brossette S.A.',
    isin: 'MA0000011587',
    sector: 'Industrie',
    desc: "Distributeur de matériaux de construction et produits sidérurgiques. Filiale du groupe Al Mada. Réseau de dépôts au Maroc.",
  },
  MOX: {
    name: 'Maghreb Oxygène S.A.',
    isin: 'MA0000010985',
    sector: 'Industrie',
    desc: "Producteur et distributeur de gaz industriels et médicaux au Maroc (oxygène, azote, acétylène). Filiale d'Air Liquide.",
  },
  SRM: {
    name: 'Société de Réalisations Mécaniques S.A.',
    isin: 'MA0000011595',
    sector: 'Industrie',
    desc: "Fabricant de composants mécaniques et de matériel ferroviaire. Fournisseur de l'ONCF et d'industries marocaines.",
  },
  MDP: {
    name: 'Med Paper S.A.',
    isin: 'MA0000011447',
    sector: 'Industrie',
    desc: "Fabricant de papier d'emballage à partir de fibres recyclées. Approvisionne les industries marocaines d'emballage.",
  },
  AFI: {
    name: 'Afric Industries S.A.',
    isin: 'MA0000012114',
    sector: 'Industrie',
    desc: "Fabricant de câbles et conducteurs électriques. Fournisseur de l'ONEE, des opérateurs télécoms et de l'industrie.",
  },
  SNP: {
    name: 'SNEP S.A.',
    isin: 'MA0000011728',
    sector: 'Industrie',
    desc: "Producteur de PVC, soude caustique et acide chlorhydrique. Filiale du groupe OCP. Fournisseur de l'industrie chimique marocaine.",
  },
  COL: {
    name: 'Colorado S.A.',
    isin: 'MA0000011934',
    sector: 'Industrie',
    desc: "Fabricant et distributeur de peintures décorative et industrielle. Marque Colorado leader dans son segment au Maroc.",
  },
  DLM: {
    name: 'Delattre Levivier Maroc S.A.',
    isin: 'MA0000011777',
    sector: 'Industrie',
    desc: "Chaudronniste industriel. Fabrique des équipements pour les secteurs de l'énergie, chimie et eau au Maroc et en Afrique.",
  },

  // ── Holdings ─────────────────────────────────────────────────────────────────
  REB: {
    name: 'REBAB COMPANY S.A.',
    isin: 'MA0000010993',
    sector: 'Holdings',
    desc: "Holding d'investissement coté à la BVC. Portefeuille diversifié d'actifs au Maroc.",
  },
};

/** Lookup with fallback for unknown tickers */
export function getCompany(ticker: string): BVCCompany | null {
  return BVC_COMPANIES[ticker.toUpperCase()] ?? null;
}
