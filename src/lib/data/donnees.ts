/**
 * BVC Données Financières — auto-generated snapshot
 * Source: TradingView Screener API (CSEMA) + Casablanca Bourse API
 * Generated: 2026-04-05T17:57:24Z
 * Data as of: 2026-04-03 (latest BVC session)
 *
 * Fields:
 *   market_cap        — BVC capitalisation boursière (MAD)
 *   pe_ratio          — Price/Earnings TTM (TradingView)
 *   revenue           — Total Revenue TTM, USD (TradingView screener)
 *   net_income        — Net Income TTM, USD (TradingView screener)
 *   ebitda            — EBITDA TTM, USD (TradingView screener)
 *   eps               — Earnings Per Share TTM, USD (TradingView screener)
 *   dividend_yield    — Dividend Yield (decimal, e.g. 0.05 = 5%)
 *   shares_outstanding — Shares Outstanding (TradingView)
 *   sector / industry — TradingView classification (English)
 *   currency          — MAD (trading currency on BVC)
 */

export interface DonneesCompany {
  company: string;
  ticker: string;
  tradingview_url: string;
  donnees: {
    market_cap: number | null;
    pe_ratio: number | null;
    revenue: number | null;
    net_income: number | null;
    ebitda: number | null;
    eps: number | null;
    dividend_yield: number | null;
    shares_outstanding: number | null;
    sector: string | null;
    industry: string | null;
    currency: string | null;
  };
}

export const DONNEES_BVC: DonneesCompany[] = [
  {
    "company": "Attijariwafa Bank",
    "ticker": "ATW",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-ATW/financials-overview/",
    "donnees": {
      "market_cap": 146553939527.0,
      "pe_ratio": 13.7672,
      "revenue": 5217992286.0,
      "net_income": 1164546809.0,
      "ebitda": null,
      "eps": 5.413112,
      "dividend_yield": 0.027933,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Regional banks",
      "currency": "MAD"
    }
  },
  {
    "company": "Managem",
    "ticker": "MNG",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-MNG/financials-overview/",
    "donnees": {
      "market_cap": 118646760000.0,
      "pe_ratio": null,
      "revenue": 1498123600.0,
      "net_income": 328418800.0,
      "ebitda": null,
      "eps": 27.680377,
      "dividend_yield": 0.004734,
      "shares_outstanding": null,
      "sector": "Non-energy minerals",
      "industry": "Other metals/Minerals",
      "currency": "MAD"
    }
  },
  {
    "company": "Maroc Telecom",
    "ticker": "IAM",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-IAM/financials-overview/",
    "donnees": {
      "market_cap": 80964680814.0,
      "pe_ratio": 11.6195,
      "revenue": 4012901400.0,
      "net_income": 762299200.0,
      "ebitda": 2326500400.0,
      "eps": 0.867137,
      "dividend_yield": 0.015053,
      "shares_outstanding": null,
      "sector": "Communications",
      "industry": "Wireless telecommunications",
      "currency": "MAD"
    }
  },
  {
    "company": "Marsa Maroc",
    "ticker": "MSA",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-MSA/financials-overview/",
    "donnees": {
      "market_cap": 56881590000.0,
      "pe_ratio": null,
      "revenue": 632879000.0,
      "net_income": 173836600.0,
      "ebitda": null,
      "eps": 2.368488,
      "dividend_yield": 0.012467,
      "shares_outstanding": null,
      "sector": "Transportation",
      "industry": "Other transportation",
      "currency": "MAD"
    }
  },
  {
    "company": "Banque Centrale Populaire",
    "ticker": "BCP",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-BCP/financials-overview/",
    "donnees": {
      "market_cap": 48794993520.0,
      "pe_ratio": null,
      "revenue": 2953800000.0,
      "net_income": 612640000.0,
      "ebitda": null,
      "eps": 2.421394,
      "dividend_yield": 0.04375,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Regional banks",
      "currency": "MAD"
    }
  },
  {
    "company": "Bank of Africa",
    "ticker": "BOA",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-BOA/financials-overview/",
    "donnees": {
      "market_cap": 44717221843.0,
      "pe_ratio": 11.9242,
      "revenue": 2681909849.0,
      "net_income": 336846838.0,
      "ebitda": null,
      "eps": 1.865512,
      "dividend_yield": 0.023892,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Major banks",
      "currency": "MAD"
    }
  },
  {
    "company": "TAQA Morocco",
    "ticker": "TQM",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-TQM/financials-overview/",
    "donnees": {
      "market_cap": 42459375600.0,
      "pe_ratio": null,
      "revenue": 1163757816.0,
      "net_income": 107290877.0,
      "ebitda": 779731434.0,
      "eps": 4.548852,
      "dividend_yield": 0.020904,
      "shares_outstanding": null,
      "sector": "Utilities",
      "industry": "Electric utilities",
      "currency": "MAD"
    }
  },
  {
    "company": "SGTM",
    "ticker": "GTM",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-GTM/financials-overview/",
    "donnees": {
      "market_cap": 42600000000.0,
      "pe_ratio": null,
      "revenue": 1659051000.0,
      "net_income": 146814800.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Industrial services",
      "industry": "Engineering & construction",
      "currency": "MAD"
    }
  },
  {
    "company": "LafargeHolcim Maroc",
    "ticker": "LHM",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-LHM/financials-overview/",
    "donnees": {
      "market_cap": 40981238760.0,
      "pe_ratio": null,
      "revenue": 977598400.0,
      "net_income": 236960400.0,
      "ebitda": null,
      "eps": 10.133525,
      "dividend_yield": 0.040698,
      "shares_outstanding": null,
      "sector": "Non-energy minerals",
      "industry": "Construction materials",
      "currency": "MAD"
    }
  },
  {
    "company": "TGCC",
    "ticker": "TGC",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-TGC/financials-overview/",
    "donnees": {
      "market_cap": 25867051672.0,
      "pe_ratio": null,
      "revenue": 746615568.0,
      "net_income": 51283487.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.015335,
      "shares_outstanding": null,
      "sector": "Industrial services",
      "industry": "Engineering & construction",
      "currency": "MAD"
    }
  },
  {
    "company": "Ciments du Maroc",
    "ticker": "CMA",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-CMA/financials-overview/",
    "donnees": {
      "market_cap": 25190826980.0,
      "pe_ratio": null,
      "revenue": 585180600.0,
      "net_income": 153378800.0,
      "ebitda": null,
      "eps": 10.624742,
      "dividend_yield": 0.035067,
      "shares_outstanding": null,
      "sector": "Non-energy minerals",
      "industry": "Construction materials",
      "currency": "MAD"
    }
  },
  {
    "company": "Cosumar",
    "ticker": "CSR",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-CSR/financials-overview/",
    "donnees": {
      "market_cap": 18141531456.0,
      "pe_ratio": null,
      "revenue": 1147277800.0,
      "net_income": 77017600.0,
      "ebitda": null,
      "eps": 0.815118,
      "dividend_yield": 0.052632,
      "shares_outstanding": null,
      "sector": "Process industries",
      "industry": "Agricultural commodities/Milling",
      "currency": "MAD"
    }
  },
  {
    "company": "Wafa Assurance",
    "ticker": "WAA",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-WAA/financials-overview/",
    "donnees": {
      "market_cap": 17150000000.0,
      "pe_ratio": null,
      "revenue": 1665724400.0,
      "net_income": 103164200.0,
      "ebitda": null,
      "eps": 29.475489,
      "dividend_yield": 0.02886,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Multi-line insurance",
      "currency": "MAD"
    }
  },
  {
    "company": "Akdital",
    "ticker": "AKT",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-AKT/financials-overview/",
    "donnees": {
      "market_cap": 15716719770.0,
      "pe_ratio": null,
      "revenue": 482782200.0,
      "net_income": 54043600.0,
      "ebitda": null,
      "eps": 3.430532,
      "dividend_yield": 0.008764,
      "shares_outstanding": null,
      "sector": "Health services",
      "industry": "Hospital/Nursing management",
      "currency": "MAD"
    }
  },
  {
    "company": "TotalEnergies Marketing Maroc",
    "ticker": "TMA",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-TMA/financials-overview/",
    "donnees": {
      "market_cap": 13440000000.0,
      "pe_ratio": null,
      "revenue": 1646371032.0,
      "net_income": 91812685.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.122366,
      "shares_outstanding": null,
      "sector": "Retail trade",
      "industry": "Specialty stores",
      "currency": "MAD"
    }
  },
  {
    "company": "Addoha",
    "ticker": "ADH",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-ADH/financials-overview/",
    "donnees": {
      "market_cap": 12760874752.0,
      "pe_ratio": null,
      "revenue": 296364600.0,
      "net_income": 54700000.0,
      "ebitda": null,
      "eps": 0.135886,
      "dividend_yield": 0.016672,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Real estate development",
      "currency": "MAD"
    }
  },
  {
    "company": "Afriquia Gaz",
    "ticker": "GAZ",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-GAZ/financials-overview/",
    "donnees": {
      "market_cap": 12718750000.0,
      "pe_ratio": 16.947,
      "revenue": 983443095.0,
      "net_income": 82104700.0,
      "ebitda": 172493277.0,
      "eps": 23.885007,
      "dividend_yield": 0.047297,
      "shares_outstanding": null,
      "sector": "Distribution services",
      "industry": "Wholesale distributors",
      "currency": "MAD"
    }
  },
  {
    "company": "CIH Bank",
    "ticker": "CIH",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-CIH/financials-overview/",
    "donnees": {
      "market_cap": 12978249948.0,
      "pe_ratio": 11.2016,
      "revenue": 942746186.0,
      "net_income": 119176203.0,
      "ebitda": null,
      "eps": 3.559887,
      "dividend_yield": 0.038283,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Regional banks",
      "currency": "MAD"
    }
  },
  {
    "company": "Sothema",
    "ticker": "SOT",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-SOT/financials-overview/",
    "donnees": {
      "market_cap": 12327997100.0,
      "pe_ratio": null,
      "revenue": 353033800.0,
      "net_income": 42228400.0,
      "ebitda": null,
      "eps": 5.551459,
      "dividend_yield": 0.0175,
      "shares_outstanding": null,
      "sector": "Health technology",
      "industry": "Pharmaceuticals: major",
      "currency": "MAD"
    }
  },
  {
    "company": "Lesieur Cristal",
    "ticker": "LES",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-LES/financials-overview/",
    "donnees": {
      "market_cap": 10776288900.0,
      "pe_ratio": 1347.1503,
      "revenue": 588353200.0,
      "net_income": 875200.0,
      "ebitda": null,
      "eps": 0.031671,
      "dividend_yield": 0.007059,
      "shares_outstanding": null,
      "sector": "Consumer non-durables",
      "industry": "Food: specialty/candy",
      "currency": "MAD"
    }
  },
  {
    "company": "Label Vie",
    "ticker": "LBV",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-LBV/financials-overview/",
    "donnees": {
      "market_cap": 12096740260.0,
      "pe_ratio": null,
      "revenue": 2027663131.0,
      "net_income": 63319692.0,
      "ebitda": 170349081.0,
      "eps": 21.879967,
      "dividend_yield": 0.027992,
      "shares_outstanding": null,
      "sector": "Retail trade",
      "industry": "Food retail",
      "currency": "MAD"
    }
  },
  {
    "company": "Sanlam Maroc",
    "ticker": "SAH",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-SAH/financials-overview/",
    "donnees": {
      "market_cap": 11115559800.0,
      "pe_ratio": 16.4304,
      "revenue": 906994703.0,
      "net_income": 74011616.0,
      "ebitda": null,
      "eps": 17.977625,
      "dividend_yield": 0.03,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Multi-line insurance",
      "currency": "MAD"
    }
  },
  {
    "company": "Crédit du Maroc",
    "ticker": "CDM",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-CDM/financials-overview/",
    "donnees": {
      "market_cap": 11153244350.0,
      "pe_ratio": 12.9156,
      "revenue": 482002287.0,
      "net_income": 94472479.0,
      "ebitda": null,
      "eps": 8.682159,
      "dividend_yield": 0.042508,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Regional banks",
      "currency": "MAD"
    }
  },
  {
    "company": "SMI",
    "ticker": "SMI",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-SMI/financials-overview/",
    "donnees": {
      "market_cap": 11681784090.0,
      "pe_ratio": null,
      "revenue": 103460598.0,
      "net_income": 18350808.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.013746,
      "shares_outstanding": null,
      "sector": "Non-energy minerals",
      "industry": "Other metals/Minerals",
      "currency": "MAD"
    }
  },
  {
    "company": "Alliances",
    "ticker": "ADI",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-ADI/financials-overview/",
    "donnees": {
      "market_cap": 9471714252.0,
      "pe_ratio": null,
      "revenue": 235369691.0,
      "net_income": 29672304.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.00878,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Real estate development",
      "currency": "MAD"
    }
  },
  {
    "company": "CFG Bank",
    "ticker": "CFG",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-CFG/financials-overview/",
    "donnees": {
      "market_cap": 7316663640.0,
      "pe_ratio": 19.1919,
      "revenue": 196415557.0,
      "net_income": 40526683.0,
      "ebitda": null,
      "eps": 1.191366,
      "dividend_yield": 0.016256,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Regional banks",
      "currency": "MAD"
    }
  },
  {
    "company": "BMCI",
    "ticker": "BCI",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-BCI/financials-overview/",
    "donnees": {
      "market_cap": 7929061671.0,
      "pe_ratio": 23.4819,
      "revenue": 505647946.0,
      "net_income": 31955349.0,
      "ebitda": null,
      "eps": 2.786411,
      "dividend_yield": 0.028759,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Regional banks",
      "currency": "MAD"
    }
  },
  {
    "company": "AtlantaSanad",
    "ticker": "ATL",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-ATL/financials-overview/",
    "donnees": {
      "market_cap": 8319136110.0,
      "pe_ratio": null,
      "revenue": 661870000.0,
      "net_income": 50980400.0,
      "ebitda": null,
      "eps": 0.845673,
      "dividend_yield": 0.043774,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Multi-line insurance",
      "currency": "MAD"
    }
  },
  {
    "company": "Sonasid",
    "ticker": "SID",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-SID/financials-overview/",
    "donnees": {
      "market_cap": 7215000000.0,
      "pe_ratio": null,
      "revenue": 698628400.0,
      "net_income": 29756800.0,
      "ebitda": null,
      "eps": 7.62995,
      "dividend_yield": 0.021595,
      "shares_outstanding": null,
      "sector": "Non-energy minerals",
      "industry": "Steel",
      "currency": "MAD"
    }
  },
  {
    "company": "Cash Plus",
    "ticker": "CAP",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-CAP/financials-overview/",
    "donnees": {
      "market_cap": 6874865200.0,
      "pe_ratio": null,
      "revenue": 195169600.0,
      "net_income": 26474800.0,
      "ebitda": null,
      "eps": 6.967051,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Commercial services",
      "industry": "Miscellaneous commercial services",
      "currency": "MAD"
    }
  },
  {
    "company": "CMT",
    "ticker": "CMT",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-CMT/financials-overview/",
    "donnees": {
      "market_cap": 6556808700.0,
      "pe_ratio": null,
      "revenue": 57627858.0,
      "net_income": -1191741.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Non-energy minerals",
      "industry": "Other metals/Minerals",
      "currency": "MAD"
    }
  },
  {
    "company": "Jet Contractors",
    "ticker": "JET",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-JET/financials-overview/",
    "donnees": {
      "market_cap": 6513472300.0,
      "pe_ratio": null,
      "revenue": 306410464.0,
      "net_income": 12750612.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.006912,
      "shares_outstanding": null,
      "sector": "Industrial services",
      "industry": "Engineering & construction",
      "currency": "MAD"
    }
  },
  {
    "company": "SBM",
    "ticker": "SBM",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-SBM/financials-overview/",
    "donnees": {
      "market_cap": 6389356474.0,
      "pe_ratio": null,
      "revenue": 336952000.0,
      "net_income": 37524200.0,
      "ebitda": null,
      "eps": 13.261063,
      "dividend_yield": 0.046512,
      "shares_outstanding": null,
      "sector": "Consumer non-durables",
      "industry": "Beverages: alcoholic",
      "currency": "MAD"
    }
  },
  {
    "company": "CMGP",
    "ticker": "CMG",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-CMG/financials-overview/",
    "donnees": {
      "market_cap": 6290333000.0,
      "pe_ratio": null,
      "revenue": 228752512.0,
      "net_income": 17939285.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0175,
      "shares_outstanding": null,
      "sector": "Producer manufacturing",
      "industry": "Industrial machinery",
      "currency": "MAD"
    }
  },
  {
    "company": "Aradei Capital",
    "ticker": "ARD",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-ARD/financials-overview/",
    "donnees": {
      "market_cap": 5090092650.0,
      "pe_ratio": null,
      "revenue": 70770532.0,
      "net_income": 58464782.0,
      "ebitda": 49470242.0,
      "eps": 4.65183,
      "dividend_yield": 0.02601,
      "shares_outstanding": null,
      "sector": "Technology services",
      "industry": "Internet software/Services",
      "currency": "MAD"
    }
  },
  {
    "company": "Risma",
    "ticker": "RIS",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-RIS/financials-overview/",
    "donnees": {
      "market_cap": 5195936834.0,
      "pe_ratio": null,
      "revenue": 178759600.0,
      "net_income": 27787600.0,
      "ebitda": null,
      "eps": 1.939531,
      "dividend_yield": 0.022222,
      "shares_outstanding": null,
      "sector": "Consumer services",
      "industry": "Hotels/Resorts/Cruise lines",
      "currency": "MAD"
    }
  },
  {
    "company": "Delta Holding",
    "ticker": "DHO",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-DHO/financials-overview/",
    "donnees": {
      "market_cap": 4818000000.0,
      "pe_ratio": 15.6838,
      "revenue": 333650063.0,
      "net_income": 33606742.0,
      "ebitda": 61119430.0,
      "eps": 0.383644,
      "dividend_yield": 0.040541,
      "shares_outstanding": null,
      "sector": "Producer manufacturing",
      "industry": "Industrial conglomerates",
      "currency": "MAD"
    }
  },
  {
    "company": "Auto Nejma",
    "ticker": "NEJ",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-NEJ/financials-overview/",
    "donnees": {
      "market_cap": 4691665440.0,
      "pe_ratio": null,
      "revenue": null,
      "net_income": null,
      "ebitda": null,
      "eps": null,
      "dividend_yield": null,
      "shares_outstanding": null,
      "sector": "Distributeurs",
      "industry": null,
      "currency": "MAD"
    }
  },
  {
    "company": "Vicenne",
    "ticker": "VCN",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-VCN/financials-overview/",
    "donnees": {
      "market_cap": 4226646200.0,
      "pe_ratio": null,
      "revenue": 82223308.0,
      "net_income": 8964807.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Distribution services",
      "industry": "Medical distributors",
      "currency": "MAD"
    }
  },
  {
    "company": "HPS",
    "ticker": "HPS",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-HPS/financials-overview/",
    "donnees": {
      "market_cap": 3925280700.0,
      "pe_ratio": null,
      "revenue": 163397051.0,
      "net_income": 11572085.0,
      "ebitda": 29635519.0,
      "eps": 1.56442,
      "dividend_yield": 0.012951,
      "shares_outstanding": null,
      "sector": "Technology services",
      "industry": "Packaged software",
      "currency": "MAD"
    }
  },
  {
    "company": "Auto Hall",
    "ticker": "ATH",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-ATH/financials-overview/",
    "donnees": {
      "market_cap": 3973267712.0,
      "pe_ratio": null,
      "revenue": 646663400.0,
      "net_income": 10940000.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.025316,
      "shares_outstanding": null,
      "sector": "Retail trade",
      "industry": "Specialty stores",
      "currency": "MAD"
    }
  },
  {
    "company": "Résidences Dar Saada",
    "ticker": "RDS",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-RDS/financials-overview/",
    "donnees": {
      "market_cap": 3703310505.0,
      "pe_ratio": null,
      "revenue": 14282738.0,
      "net_income": -8138272.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Real estate development",
      "currency": "MAD"
    }
  },
  {
    "company": "Oulmès",
    "ticker": "OUL",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-OUL/financials-overview/",
    "donnees": {
      "market_cap": 2486880000.0,
      "pe_ratio": null,
      "revenue": 288988114.0,
      "net_income": 5689036.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.018578,
      "shares_outstanding": null,
      "sector": "Consumer non-durables",
      "industry": "Beverages: non-alcoholic",
      "currency": "MAD"
    }
  },
  {
    "company": "Timar",
    "ticker": "TIM",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-TIM/financials-overview/",
    "donnees": {
      "market_cap": null,
      "pe_ratio": null,
      "revenue": null,
      "net_income": null,
      "ebitda": null,
      "eps": null,
      "dividend_yield": null,
      "shares_outstanding": null,
      "sector": null,
      "industry": null,
      "currency": "MAD"
    }
  },
  {
    "company": "Mutandis",
    "ticker": "MUT",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-MUT/financials-overview/",
    "donnees": {
      "market_cap": 2120276794.0,
      "pe_ratio": null,
      "revenue": 221206800.0,
      "net_income": 13893800.0,
      "ebitda": null,
      "eps": 1.503397,
      "dividend_yield": 0.045852,
      "shares_outstanding": null,
      "sector": "Consumer non-durables",
      "industry": "Household/Personal care",
      "currency": "MAD"
    }
  },
  {
    "company": "Disway",
    "ticker": "DIS",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-DIS/financials-overview/",
    "donnees": {
      "market_cap": 1405081266.0,
      "pe_ratio": null,
      "revenue": 227134502.0,
      "net_income": 9349098.0,
      "ebitda": 15384255.0,
      "eps": 4.958008,
      "dividend_yield": 0.055172,
      "shares_outstanding": null,
      "sector": "Distribution services",
      "industry": "Electronics distributors",
      "currency": "MAD"
    }
  },
  {
    "company": "DLM",
    "ticker": "DLM",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-DLM/financials-overview/",
    "donnees": {
      "market_cap": 70000000.0,
      "pe_ratio": null,
      "revenue": null,
      "net_income": null,
      "ebitda": null,
      "eps": null,
      "dividend_yield": null,
      "shares_outstanding": null,
      "sector": "Ingénieries et Biens d'Equipement Industriels",
      "industry": null,
      "currency": "MAD"
    }
  },
  {
    "company": "Microdata",
    "ticker": "MIC",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-MIC/financials-overview/",
    "donnees": {
      "market_cap": 1344000000.0,
      "pe_ratio": null,
      "revenue": 107146360.0,
      "net_income": 7603300.0,
      "ebitda": null,
      "eps": 4.525769,
      "dividend_yield": 0.051948,
      "shares_outstanding": null,
      "sector": "Technology services",
      "industry": "Information technology services",
      "currency": "MAD"
    }
  },
  {
    "company": "Med Paper",
    "ticker": "MDP",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-MDP/financials-overview/",
    "donnees": {
      "market_cap": 118638810.0,
      "pe_ratio": null,
      "revenue": 10374817.0,
      "net_income": 784789.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Process industries",
      "industry": "Containers/Packaging",
      "currency": "MAD"
    }
  },
  {
    "company": "Maghreb Oxygène",
    "ticker": "MOX",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-MOX/financials-overview/",
    "donnees": {
      "market_cap": 320896875.0,
      "pe_ratio": 20.774,
      "revenue": 36141931.0,
      "net_income": 1689902.0,
      "ebitda": 4088387.0,
      "eps": 2.07988,
      "dividend_yield": 0.010458,
      "shares_outstanding": null,
      "sector": "Process industries",
      "industry": "Chemicals: specialty",
      "currency": "MAD"
    }
  },
  {
    "company": "M2M Group",
    "ticker": "M2M",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-M2M/financials-overview/",
    "donnees": {
      "market_cap": 273815338.0,
      "pe_ratio": null,
      "revenue": 10086078.0,
      "net_income": 1439927.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Technology services",
      "industry": "Information technology services",
      "currency": "MAD"
    }
  },
  {
    "company": "Mutuelle Agricole d'Assurances",
    "ticker": "MAB",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-MAB/financials-overview/",
    "donnees": {
      "market_cap": 1220848524.0,
      "pe_ratio": null,
      "revenue": 503962696.0,
      "net_income": 16212971.0,
      "ebitda": 482116282.0,
      "eps": 11.713031,
      "dividend_yield": 0.058954,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Finance/Rental/Leasing",
      "currency": "MAD"
    }
  },
  {
    "company": "Ennakl",
    "ticker": "NKL",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-NKL/financials-overview/",
    "donnees": {
      "market_cap": 1479000000.0,
      "pe_ratio": null,
      "revenue": 212750146.0,
      "net_income": 15177105.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.045714,
      "shares_outstanding": null,
      "sector": "Retail trade",
      "industry": "Specialty stores",
      "currency": "MAD"
    }
  },
  {
    "company": "IB Maroc",
    "ticker": "IBC",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-IBC/financials-overview/",
    "donnees": {
      "market_cap": 25065859.0,
      "pe_ratio": null,
      "revenue": null,
      "net_income": null,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Technology services",
      "industry": "Information technology services",
      "currency": "MAD"
    }
  },
  {
    "company": "Immorente",
    "ticker": "IMO",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-IMO/financials-overview/",
    "donnees": {
      "market_cap": 820537700.0,
      "pe_ratio": 19.7785,
      "revenue": 8323152.0,
      "net_income": 4538568.0,
      "ebitda": 9871799.0,
      "eps": 0.503896,
      "dividend_yield": 0.056862,
      "shares_outstanding": null,
      "sector": "Finance",
      "industry": "Real estate investment trusts",
      "currency": "MAD"
    }
  },
  {
    "company": "Involys",
    "ticker": "INV",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-INV/financials-overview/",
    "donnees": {
      "market_cap": 52393820.0,
      "pe_ratio": 523.9189,
      "revenue": 4091560.0,
      "net_income": 10940.0,
      "ebitda": null,
      "eps": 0.028586,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Technology services",
      "industry": "Information technology services",
      "currency": "MAD"
    }
  },
  {
    "company": "S2M",
    "ticker": "S2M",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-S2M/financials-overview/",
    "donnees": {
      "market_cap": 453947130.0,
      "pe_ratio": null,
      "revenue": 30733150.0,
      "net_income": 2890757.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Technology services",
      "industry": "Packaged software",
      "currency": "MAD"
    }
  },
  {
    "company": "Samir",
    "ticker": "SAM",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-SAM/financials-overview/",
    "donnees": {
      "market_cap": 1520777187.0,
      "pe_ratio": null,
      "revenue": null,
      "net_income": null,
      "ebitda": null,
      "eps": null,
      "dividend_yield": null,
      "shares_outstanding": null,
      "sector": "Pétrole et Gaz",
      "industry": null,
      "currency": "MAD"
    }
  },
  {
    "company": "SNEP",
    "ticker": "SNP",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-SNP/financials-overview/",
    "donnees": {
      "market_cap": 924000000.0,
      "pe_ratio": null,
      "revenue": 62243967.0,
      "net_income": -4305745.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Process industries",
      "industry": "Chemicals: major diversified",
      "currency": "MAD"
    }
  },
  {
    "company": "Stroc Industrie",
    "ticker": "STR",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-STR/financials-overview/",
    "donnees": {
      "market_cap": 201385470.0,
      "pe_ratio": null,
      "revenue": 11564547.0,
      "net_income": -1236102.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Industrial services",
      "industry": "Engineering & construction",
      "currency": "MAD"
    }
  },
  {
    "company": "SRM",
    "ticker": "SRM",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-SRM/financials-overview/",
    "donnees": {
      "market_cap": 162560000.0,
      "pe_ratio": null,
      "revenue": 35033497.0,
      "net_income": 188869.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Distribution services",
      "industry": "Wholesale distributors",
      "currency": "MAD"
    }
  },
  {
    "company": "SNA",
    "ticker": "SNA",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-SNA/financials-overview/",
    "donnees": {
      "market_cap": 1247508075.0,
      "pe_ratio": null,
      "revenue": 32864439.0,
      "net_income": 2061521.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Distribution services",
      "industry": "Wholesale distributors",
      "currency": "MAD"
    }
  },
  {
    "company": "UMR",
    "ticker": "UMR",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-UMR/financials-overview/",
    "donnees": {
      "market_cap": 1826220800.0,
      "pe_ratio": null,
      "revenue": 123797616.0,
      "net_income": -7984464.0,
      "ebitda": null,
      "eps": null,
      "dividend_yield": 0.00625,
      "shares_outstanding": null,
      "sector": "Consumer non-durables",
      "industry": "Food: meat/fish/dairy",
      "currency": "MAD"
    }
  },
  {
    "company": "Zellidja",
    "ticker": "ZDJ",
    "tradingview_url": "https://www.tradingview.com/symbols/CSEMA-ZDJ/financials-overview/",
    "donnees": {
      "market_cap": 129693014.0,
      "pe_ratio": null,
      "revenue": 82815800.0,
      "net_income": 2361618.0,
      "ebitda": null,
      "eps": 1.359536,
      "dividend_yield": 0.0,
      "shares_outstanding": null,
      "sector": "Non-energy minerals",
      "industry": "Other metals/Minerals",
      "currency": "MAD"
    }
  }
];

export function getDonneesByTicker(ticker: string): DonneesCompany | undefined {
  return DONNEES_BVC.find((c) => c.ticker === ticker);
}