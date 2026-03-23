// Unified asset catalogue — single source of truth for the Portfolio Builder.
// Stocks mirror the ASSETS array on the Marchés page (same symbols/names).
// OPCVM funds mirror opcvm.ts (same names, NAV used as reference price).

export interface StockAsset {
  symbol: string;        // e.g. "CSEMA:ATW"
  name: string;
  type: 'stock';
  exchange: 'CSEMA';
  sector: string;
}

export interface OpcvmAsset {
  symbol: string;        // e.g. "ATW-AAM"
  name: string;
  type: 'opcvm';
  manager: string;
  managerCode: string;
  category: 'Actions' | 'Obligataire' | 'Monétaire' | 'Diversifié';
  /** Last known Valeur Liquidative (VL) in MAD from opcvm.ts — used as reference price. */
  nav: number;
}

export type CatalogueAsset = StockAsset | OpcvmAsset;

// ─── Section A — Casablanca Stock Exchange (77 stocks) ───────────────────────

export const STOCK_ASSETS: StockAsset[] = [
  // Banques
  { symbol: 'CSEMA:ATW', name: 'Attijariwafa Bank',           type: 'stock', exchange: 'CSEMA', sector: 'Banque'           },
  { symbol: 'CSEMA:BCP', name: 'Banque Centrale Populaire',   type: 'stock', exchange: 'CSEMA', sector: 'Banque'           },
  { symbol: 'CSEMA:BOA', name: 'Bank of Africa',              type: 'stock', exchange: 'CSEMA', sector: 'Banque'           },
  { symbol: 'CSEMA:CIH', name: 'CIH Bank',                   type: 'stock', exchange: 'CSEMA', sector: 'Banque'           },
  { symbol: 'CSEMA:CDM', name: 'Crédit du Maroc',             type: 'stock', exchange: 'CSEMA', sector: 'Banque'           },
  { symbol: 'CSEMA:CFG', name: 'CFG Bank',                    type: 'stock', exchange: 'CSEMA', sector: 'Banque'           },
  { symbol: 'CSEMA:BCI', name: 'BMCI',                        type: 'stock', exchange: 'CSEMA', sector: 'Banque'           },
  // Assurance
  { symbol: 'CSEMA:WAA', name: 'Wafa Assurance',              type: 'stock', exchange: 'CSEMA', sector: 'Assurance'        },
  { symbol: 'CSEMA:ATL', name: 'AtlantaSanad',                type: 'stock', exchange: 'CSEMA', sector: 'Assurance'        },
  { symbol: 'CSEMA:SAH', name: 'Sanlam Maroc',                type: 'stock', exchange: 'CSEMA', sector: 'Assurance'        },
  { symbol: 'CSEMA:AGM', name: 'Agma',                        type: 'stock', exchange: 'CSEMA', sector: 'Assurance'        },
  { symbol: 'CSEMA:AFM', name: 'AFMA',                        type: 'stock', exchange: 'CSEMA', sector: 'Assurance'        },
  // Télécoms
  { symbol: 'CSEMA:IAM', name: 'Maroc Telecom',               type: 'stock', exchange: 'CSEMA', sector: 'Télécoms'         },
  // Énergie
  { symbol: 'CSEMA:TQM', name: 'TAQA Morocco',                type: 'stock', exchange: 'CSEMA', sector: 'Énergie'          },
  { symbol: 'CSEMA:GAZ', name: 'Afriquia Gaz',                type: 'stock', exchange: 'CSEMA', sector: 'Énergie'          },
  { symbol: 'CSEMA:TMA', name: 'TotalEnergies Marketing Maroc', type: 'stock', exchange: 'CSEMA', sector: 'Énergie'        },
  { symbol: 'CSEMA:MOX', name: 'Maghreb Oxygène',             type: 'stock', exchange: 'CSEMA', sector: 'Énergie'          },
  // Mines & Ressources
  { symbol: 'CSEMA:MNG', name: 'Managem',                     type: 'stock', exchange: 'CSEMA', sector: 'Mines'            },
  { symbol: 'CSEMA:SMI', name: 'SMI (Imiter)',                type: 'stock', exchange: 'CSEMA', sector: 'Mines'            },
  { symbol: 'CSEMA:CMT', name: 'Compagnie Minière de Touissit', type: 'stock', exchange: 'CSEMA', sector: 'Mines'          },
  { symbol: 'CSEMA:ZDJ', name: 'Zellidja',                    type: 'stock', exchange: 'CSEMA', sector: 'Mines'            },
  // BTP & Construction
  { symbol: 'CSEMA:GTM', name: 'TGCC (Travaux du Maroc)',     type: 'stock', exchange: 'CSEMA', sector: 'BTP'              },
  { symbol: 'CSEMA:TGC', name: 'TGCC SA',                     type: 'stock', exchange: 'CSEMA', sector: 'BTP'              },
  { symbol: 'CSEMA:LHM', name: 'LafargeHolcim Maroc',         type: 'stock', exchange: 'CSEMA', sector: 'BTP'              },
  { symbol: 'CSEMA:CMA', name: 'Ciments du Maroc',            type: 'stock', exchange: 'CSEMA', sector: 'BTP'              },
  { symbol: 'CSEMA:JET', name: 'Jet Contractors',             type: 'stock', exchange: 'CSEMA', sector: 'BTP'              },
  { symbol: 'CSEMA:STR', name: 'Stroc Industrie',             type: 'stock', exchange: 'CSEMA', sector: 'BTP'              },
  { symbol: 'CSEMA:SRM', name: 'Réalisations Mécaniques',     type: 'stock', exchange: 'CSEMA', sector: 'BTP'              },
  // Immobilier
  { symbol: 'CSEMA:ADH', name: 'Addoha',                      type: 'stock', exchange: 'CSEMA', sector: 'Immobilier'       },
  { symbol: 'CSEMA:ADI', name: 'Alliances Dév. Immobilier',   type: 'stock', exchange: 'CSEMA', sector: 'Immobilier'       },
  { symbol: 'CSEMA:RDS', name: 'Résidences Dar Saada',        type: 'stock', exchange: 'CSEMA', sector: 'Immobilier'       },
  { symbol: 'CSEMA:ARD', name: 'Aradei Capital',              type: 'stock', exchange: 'CSEMA', sector: 'Immobilier'       },
  { symbol: 'CSEMA:IMO', name: 'Immorente Invest',            type: 'stock', exchange: 'CSEMA', sector: 'Immobilier'       },
  { symbol: 'CSEMA:RIS', name: 'Risma',                       type: 'stock', exchange: 'CSEMA', sector: 'Immobilier'       },
  { symbol: 'CSEMA:BAL', name: 'Balima',                      type: 'stock', exchange: 'CSEMA', sector: 'Immobilier'       },
  // Agroalimentaire
  { symbol: 'CSEMA:CSR', name: 'Cosumar',                     type: 'stock', exchange: 'CSEMA', sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:LES', name: 'Lesieur Cristal',             type: 'stock', exchange: 'CSEMA', sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:SBM', name: 'Société des Boissons du Maroc', type: 'stock', exchange: 'CSEMA', sector: 'Agroalimentaire' },
  { symbol: 'CSEMA:OUL', name: "Eaux Minérales d'Oulmès",    type: 'stock', exchange: 'CSEMA', sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:MUT', name: 'Mutandis',                    type: 'stock', exchange: 'CSEMA', sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:DRI', name: 'Dari Couspate',               type: 'stock', exchange: 'CSEMA', sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:CRS', name: 'Cartier Saada',               type: 'stock', exchange: 'CSEMA', sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:UMR', name: 'Unimer',                      type: 'stock', exchange: 'CSEMA', sector: 'Agroalimentaire'  },
  // Distribution & Commerce
  { symbol: 'CSEMA:LBV', name: "Label'Vie",                   type: 'stock', exchange: 'CSEMA', sector: 'Distribution'     },
  { symbol: 'CSEMA:ATH', name: 'Auto Hall',                   type: 'stock', exchange: 'CSEMA', sector: 'Distribution'     },
  { symbol: 'CSEMA:NEJ', name: 'Auto Nejma',                  type: 'stock', exchange: 'CSEMA', sector: 'Distribution'     },
  { symbol: 'CSEMA:SNA', name: 'Stokvis Nord Afrique',        type: 'stock', exchange: 'CSEMA', sector: 'Distribution'     },
  { symbol: 'CSEMA:FBR', name: 'Fenie Brossette',             type: 'stock', exchange: 'CSEMA', sector: 'Distribution'     },
  { symbol: 'CSEMA:NKL', name: 'Ennakl Automobiles',          type: 'stock', exchange: 'CSEMA', sector: 'Distribution'     },
  // Santé
  { symbol: 'CSEMA:AKT', name: 'Akdital',                     type: 'stock', exchange: 'CSEMA', sector: 'Santé'            },
  { symbol: 'CSEMA:SOT', name: 'Sothema',                     type: 'stock', exchange: 'CSEMA', sector: 'Santé'            },
  { symbol: 'CSEMA:PRO', name: 'Promopharm',                  type: 'stock', exchange: 'CSEMA', sector: 'Santé'            },
  // Finance & Crédit
  { symbol: 'CSEMA:EQD', name: 'EQDOM',                       type: 'stock', exchange: 'CSEMA', sector: 'Crédit'           },
  { symbol: 'CSEMA:SLF', name: 'Salafin',                     type: 'stock', exchange: 'CSEMA', sector: 'Crédit'           },
  { symbol: 'CSEMA:MAB', name: 'Maghreb Crédit-bail',         type: 'stock', exchange: 'CSEMA', sector: 'Crédit'           },
  { symbol: 'CSEMA:MLE', name: 'Maroc Leasing',               type: 'stock', exchange: 'CSEMA', sector: 'Crédit'           },
  { symbol: 'CSEMA:CAP', name: 'Cash Plus',                   type: 'stock', exchange: 'CSEMA', sector: 'Crédit'           },
  // Technologie & IT
  { symbol: 'CSEMA:HPS', name: 'HPS (Hightech Payment)',      type: 'stock', exchange: 'CSEMA', sector: 'Technologie'      },
  { symbol: 'CSEMA:DWY', name: 'Disway',                      type: 'stock', exchange: 'CSEMA', sector: 'Technologie'      },
  { symbol: 'CSEMA:M2M', name: 'M2M Group',                   type: 'stock', exchange: 'CSEMA', sector: 'Technologie'      },
  { symbol: 'CSEMA:MIC', name: 'Microdata',                   type: 'stock', exchange: 'CSEMA', sector: 'Technologie'      },
  { symbol: 'CSEMA:DYT', name: 'Disty Technologies',          type: 'stock', exchange: 'CSEMA', sector: 'Technologie'      },
  { symbol: 'CSEMA:INV', name: 'Involys',                     type: 'stock', exchange: 'CSEMA', sector: 'Technologie'      },
  { symbol: 'CSEMA:IBC', name: 'IB Maroc.com',                type: 'stock', exchange: 'CSEMA', sector: 'Technologie'      },
  { symbol: 'CSEMA:S2M', name: 'S2M (Monétique)',             type: 'stock', exchange: 'CSEMA', sector: 'Technologie'      },
  // Industrie
  { symbol: 'CSEMA:DHO', name: 'Delta Holding',               type: 'stock', exchange: 'CSEMA', sector: 'Industrie'        },
  { symbol: 'CSEMA:CMG', name: 'CMGP Group',                  type: 'stock', exchange: 'CSEMA', sector: 'Industrie'        },
  { symbol: 'CSEMA:ALM', name: 'Aluminium du Maroc',          type: 'stock', exchange: 'CSEMA', sector: 'Industrie'        },
  { symbol: 'CSEMA:AFI', name: 'Afric Industries',            type: 'stock', exchange: 'CSEMA', sector: 'Industrie'        },
  { symbol: 'CSEMA:SNP', name: 'SNEP',                        type: 'stock', exchange: 'CSEMA', sector: 'Industrie'        },
  { symbol: 'CSEMA:MDP', name: 'Med Paper',                   type: 'stock', exchange: 'CSEMA', sector: 'Industrie'        },
  { symbol: 'CSEMA:SID', name: 'SONASID',                     type: 'stock', exchange: 'CSEMA', sector: 'Industrie'        },
  { symbol: 'CSEMA:COL', name: 'Colorado',                    type: 'stock', exchange: 'CSEMA', sector: 'Industrie'        },
  // Transport & Logistique
  { symbol: 'CSEMA:MSA', name: 'Marsa Maroc',                 type: 'stock', exchange: 'CSEMA', sector: 'Transport'        },
  { symbol: 'CSEMA:CTM', name: 'CTM',                         type: 'stock', exchange: 'CSEMA', sector: 'Transport'        },
  // Holding & Divers
  { symbol: 'CSEMA:VCN', name: 'Vicenne',                     type: 'stock', exchange: 'CSEMA', sector: 'Holding'          },
  { symbol: 'CSEMA:REB', name: 'Rebab Company',               type: 'stock', exchange: 'CSEMA', sector: 'Holding'          },
];

// ─── Section B — OPCVM Funds (16 funds) ──────────────────────────────────────
// NAV values sourced from opcvm.ts (last known Valeur Liquidative in MAD).
// No live VL API is available — these are reference prices used as purchase price
// when user selects an OPCVM fund. Labeled "Prix de référence (VL)" in the UI.

export const OPCVM_ASSETS: OpcvmAsset[] = [
  // Attijariwafa / Wafa Gestion
  { symbol: 'ATW-AAM',  name: 'Attijari Actions Maroc',      type: 'opcvm', manager: 'Attijariwafa Bank', managerCode: 'ATW',  category: 'Actions',     nav: 2847.50 },
  { symbol: 'ATW-WOML', name: 'Wafa Obligations ML',          type: 'opcvm', manager: 'Attijariwafa Bank', managerCode: 'ATW',  category: 'Obligataire', nav: 1654.30 },
  { symbol: 'ATW-AMP',  name: 'Attijari Monétaire Plus',      type: 'opcvm', manager: 'Attijariwafa Bank', managerCode: 'ATW',  category: 'Monétaire',   nav: 1124.80 },
  { symbol: 'ATW-WDE',  name: 'Wafa Diversifié Équilibre',    type: 'opcvm', manager: 'Attijariwafa Bank', managerCode: 'ATW',  category: 'Diversifié',  nav: 1893.60 },
  // BMCE Capital / Bank of Africa
  { symbol: 'BOA-BCA',  name: 'BMCE Capital Actions',         type: 'opcvm', manager: 'BMCE Capital',      managerCode: 'BMCE', category: 'Actions',     nav: 3120.00 },
  { symbol: 'BOA-BCOC', name: 'BMCE Capital Oblig Court',     type: 'opcvm', manager: 'BMCE Capital',      managerCode: 'BMCE', category: 'Obligataire', nav: 1430.50 },
  { symbol: 'BOA-BTD',  name: 'BMCE Trésorerie Dynamique',    type: 'opcvm', manager: 'BMCE Capital',      managerCode: 'BMCE', category: 'Monétaire',   nav: 1098.20 },
  { symbol: 'BOA-BCC',  name: 'BMCE Capital Croissance',      type: 'opcvm', manager: 'BMCE Capital',      managerCode: 'BMCE', category: 'Diversifié',  nav: 2245.70 },
  // CDG Capital
  { symbol: 'CDG-CAM',  name: 'CDG Actions Maroc',            type: 'opcvm', manager: 'CDG Capital',       managerCode: 'CDG',  category: 'Actions',     nav: 2650.40 },
  { symbol: 'CDG-COLT', name: 'CDG Obligataire Long Terme',   type: 'opcvm', manager: 'CDG Capital',       managerCode: 'CDG',  category: 'Obligataire', nav: 1820.90 },
  { symbol: 'CDG-CCM',  name: 'CDG Cash Management',          type: 'opcvm', manager: 'CDG Capital',       managerCode: 'CDG',  category: 'Monétaire',   nav: 1010.60 },
  { symbol: 'CDG-CSP',  name: 'CDG Sérénité Patrimoine',      type: 'opcvm', manager: 'CDG Capital',       managerCode: 'CDG',  category: 'Diversifié',  nav: 1560.30 },
  // CIH Capital Conseil
  { symbol: 'CIH-CEA',  name: 'CIH Épargne Actions',          type: 'opcvm', manager: 'CIH Capital',       managerCode: 'CIH',  category: 'Actions',     nav: 1975.80 },
  { symbol: 'CIH-COMT', name: 'CIH Obligataire Moyen Terme',  type: 'opcvm', manager: 'CIH Capital',       managerCode: 'CIH',  category: 'Obligataire', nav: 1340.20 },
  { symbol: 'CIH-LIQ',  name: 'CIH Liquidités',               type: 'opcvm', manager: 'CIH Capital',       managerCode: 'CIH',  category: 'Monétaire',   nav: 1005.40 },
  { symbol: 'CIH-CFA',  name: 'CIH Flexible Allocation',      type: 'opcvm', manager: 'CIH Capital',       managerCode: 'CIH',  category: 'Diversifié',  nav: 1715.90 },
];

export const ALL_ASSETS: CatalogueAsset[] = [...STOCK_ASSETS, ...OPCVM_ASSETS];
