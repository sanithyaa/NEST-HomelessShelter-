import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
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
      // Authentication
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        phone: 'Phone Number',
        role: 'Role',
      },
      // Profile
      profile: {
        create_profile: 'Create Profile',
        submit: 'Submit',
        consent: 'I consent to data collection',
        view_all: 'View All Profiles',
        edit: 'Edit',
        delete: 'Delete',
      },
      // Offline
      offline: {
        offline_banner: 'You are offline. Changes will sync when connection is restored.',
        sync_pending: 'Pending sync',
        sync_now: 'Sync Now',
        syncing: 'Syncing...',
        sync_success: 'Synced successfully',
        sync_failed: 'Sync failed',
        saved_offline: 'Saved offline — will sync when online',
      },
      // Reports
      reports: {
        title: 'Reports & Analytics',
        overview: 'Overview',
        date_range: 'Date Range',
        last_7_days: 'Last 7 Days',
        last_30_days: 'Last 30 Days',
        last_90_days: 'Last 90 Days',
        export_csv: 'Export CSV',
        download_pdf: 'Download PDF',
        total_profiles: 'Total Profiles',
        total_shelters: 'Total Shelters',
        total_jobs: 'Total Jobs',
        total_matches: 'Total Matches',
        assignments_today: 'Assignments Today',
        profiles_over_time: 'Profiles Over Time',
        assignments_over_time: 'Assignments Over Time',
        exporting: 'Exporting...',
        generating_pdf: 'Generating PDF...',
      },
      // Common
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        close: 'Close',
        success: 'Success',
        error: 'Error',
      },
    },
  },
  hi: {
    translation: {
      // Navigation
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
      // Authentication
      auth: {
        login: 'लॉगिन',
        register: 'रजिस्टर',
        logout: 'लॉगआउट',
        email: 'ईमेल',
        password: 'पासवर्ड',
        phone: 'फोन नंबर',
        role: 'भूमिका',
      },
      // Profile
      profile: {
        create_profile: 'प्रोफाइल बनाएं',
        submit: 'जमा करें',
        consent: 'मैं डेटा संग्रह के लिए सहमत हूं',
        view_all: 'सभी प्रोफाइल देखें',
        edit: 'संपादित करें',
        delete: 'हटाएं',
      },
      // Offline
      offline: {
        offline_banner: 'आप ऑफ़लाइन हैं। कनेक्शन बहाल होने पर परिवर्तन सिंक होंगे।',
        sync_pending: 'सिंक लंबित',
        sync_now: 'अभी सिंक करें',
        syncing: 'सिंक हो रहा है...',
        sync_success: 'सफलतापूर्वक सिंक किया गया',
        sync_failed: 'सिंक विफल',
        saved_offline: 'ऑफ़लाइन सहेजा गया — ऑनलाइन होने पर सिंक होगा',
      },
      // Reports
      reports: {
        title: 'रिपोर्ट और विश्लेषण',
        overview: 'अवलोकन',
        date_range: 'तिथि सीमा',
        last_7_days: 'पिछले 7 दिन',
        last_30_days: 'पिछले 30 दिन',
        last_90_days: 'पिछले 90 दिन',
        export_csv: 'CSV निर्यात करें',
        download_pdf: 'PDF डाउनलोड करें',
        total_profiles: 'कुल प्रोफाइल',
        total_shelters: 'कुल आश्रय',
        total_jobs: 'कुल नौकरियां',
        total_matches: 'कुल मैच',
        assignments_today: 'आज के असाइनमेंट',
        profiles_over_time: 'समय के साथ प्रोफाइल',
        assignments_over_time: 'समय के साथ असाइनमेंट',
        exporting: 'निर्यात हो रहा है...',
        generating_pdf: 'PDF बन रहा है...',
      },
      // Common
      common: {
        loading: 'लोड हो रहा है...',
        save: 'सहेजें',
        cancel: 'रद्द करें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        create: 'बनाएं',
        update: 'अपडेट करें',
        search: 'खोजें',
        filter: 'फ़िल्टर',
        close: 'बंद करें',
        success: 'सफलता',
        error: 'त्रुटि',
      },
    },
  },
};

export function initI18n() {
  if (!i18n.isInitialized) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'en',
        lng: 'en', // Set default language
        interpolation: {
          escapeValue: false,
        },
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
        },
        react: {
          useSuspense: false, // Disable suspense to prevent blocking
        },
      });
  }
  return i18n;
}

export default i18n;
