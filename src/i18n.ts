import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// FR
import frCommon from '@/locales/fr/common.json';
import frHome from '@/locales/fr/home.json';
import frCalendrier from '@/locales/fr/calendrier.json';
import frPortfolio from '@/locales/fr/portfolio.json';
import frFondateur from '@/locales/fr/fondateur.json';
import frMarches from '@/locales/fr/marches.json';
import frErrors from '@/locales/fr/errors.json';
import frDonate from '@/locales/fr/donate.json';
import frChat from '@/locales/fr/chat.json';

// EN
import enCommon from '@/locales/en/common.json';
import enHome from '@/locales/en/home.json';
import enCalendrier from '@/locales/en/calendrier.json';
import enPortfolio from '@/locales/en/portfolio.json';
import enFondateur from '@/locales/en/fondateur.json';
import enMarches from '@/locales/en/marches.json';
import enErrors from '@/locales/en/errors.json';
import enDonate from '@/locales/en/donate.json';
import enChat from '@/locales/en/chat.json';

// ES
import esCommon from '@/locales/es/common.json';
import esHome from '@/locales/es/home.json';
import esCalendrier from '@/locales/es/calendrier.json';
import esPortfolio from '@/locales/es/portfolio.json';
import esFondateur from '@/locales/es/fondateur.json';
import esMarches from '@/locales/es/marches.json';
import esErrors from '@/locales/es/errors.json';
import esDonate from '@/locales/es/donate.json';
import esChat from '@/locales/es/chat.json';

i18n.use(initReactI18next).init({
  resources: {
    fr: {
      common: frCommon,
      home: frHome,
      calendrier: frCalendrier,
      portfolio: frPortfolio,
      fondateur: frFondateur,
      marches: frMarches,
      errors: frErrors,
      donate: frDonate,
      chat: frChat,
    },
    en: {
      common: enCommon,
      home: enHome,
      calendrier: enCalendrier,
      portfolio: enPortfolio,
      fondateur: enFondateur,
      marches: enMarches,
      errors: enErrors,
      donate: enDonate,
      chat: enChat,
    },
    es: {
      common: esCommon,
      home: esHome,
      calendrier: esCalendrier,
      portfolio: esPortfolio,
      fondateur: esFondateur,
      marches: esMarches,
      errors: esErrors,
      donate: esDonate,
      chat: esChat,
    },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS: 'common',
  ns: ['common', 'home', 'calendrier', 'portfolio', 'fondateur', 'marches', 'errors', 'donate', 'chat'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
