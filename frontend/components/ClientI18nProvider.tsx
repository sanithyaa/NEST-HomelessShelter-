'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        dashboard: 'Dashboard',
        profiles: 'Profiles',
        resources: 'Resources',
        matches: 'Matches',
        reports: 'Reports',
        settings: 'Settings',
        help: 'Help',
        shelters: 'Shelters',
        jobs: 'Jobs',
      },
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
      },
      profile: {
        create_profile: 'Create Profile',
        submit: 'Submit',
        consent: 'I consent to data collection',
      },
      offline: {
        offline_banner: 'You are offline. Changes will sync when connection is restored.',
        sync_pending: 'Pending sync',
        sync_now: 'Sync Now',
        syncing: 'Syncing...',
      },
      reports: {
        title: 'Reports & Analytics',
        last_7_days: 'Last 7 Days',
        last_30_days: 'Last 30 Days',
        last_90_days: 'Last 90 Days',
      },
      common: {
        loading: 'Loading...',
      },
    },
  },
  hi: {
    translation: {
      nav: {
        home: 'होम',
        dashboard: 'डैशबोर्ड',
        profiles: 'प्रोफाइल',
        resources: 'संसाधन',
        matches: 'मैच',
        reports: 'रिपोर्ट',
        settings: 'सेटिंग्स',
        help: 'मदद',
        shelters: 'आश्रय',
        jobs: 'नौकरियां',
      },
      auth: {
        login: 'लॉगिन',
        register: 'रजिस्टर',
        logout: 'लॉगआउट',
      },
      profile: {
        create_profile: 'प्रोफाइल बनाएं',
        submit: 'जमा करें',
        consent: 'मैं डेटा संग्रह के लिए सहमत हूं',
      },
      offline: {
        offline_banner: 'आप ऑफ़लाइन हैं। कनेक्शन बहाल होने पर परिवर्तन सिंक होंगे।',
        sync_pending: 'सिंक लंबित',
        sync_now: 'अभी सिंक करें',
        syncing: 'सिंक हो रहा है...',
      },
      reports: {
        title: 'रिपोर्ट और विश्लेषण',
        last_7_days: 'पिछले 7 दिन',
        last_30_days: 'पिछले 30 दिन',
        last_90_days: 'पिछले 90 दिन',
      },
      common: {
        loading: 'लोड हो रहा है...',
      },
    },
  },
};

// Initialize i18n immediately (synchronously)
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      lng: 'en',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      react: {
        useSuspense: false,
      },
    });
}

export function ClientI18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
