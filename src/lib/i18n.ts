import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          title: 'Settings',
          description: 'Manage your account, preferences, and app settings.',
          account: {
            title: 'Account',
            description: 'Update your profile information and manage your account.',
            emailLabel: 'Email',
            passwordLabel: 'Password',
            changePasswordButton: 'Change Password',
            manageProfileButton: 'Manage Profile',
          },
          appearance: {
            title: 'Appearance',
            description: 'Customize the look and feel of the app.',
            theme: {
              title: 'Theme',
              description: 'Select a theme for the application.',
              light: 'Light',
              dark: 'Dark',
              system: 'System',
            },
            language: {
              title: 'Language',
              description: 'Choose your preferred language.',
              selectPlaceholder: 'Select language',
            },
          },
        },
      },
      ur: {
        translation: {
            title: 'ترتیبات',
            description: 'اپنے اکاؤنٹ، ترجیحات، اور ایپ کی ترتیبات کا نظم کریں۔',
            account: {
              title: 'اکاؤنٹ',
              description: 'اپنی پروفائل کی معلومات کو اپ ڈیٹ کریں اور اپنے اکاؤنٹ کا نظم کریں۔',
              emailLabel: 'ای میل',
              passwordLabel: 'پاس ورڈ',
              changePasswordButton: 'پاس ورڈ تبدیل کریں',
              manageProfileButton: 'پروفائل کا نظم کریں',
            },
            appearance: {
              title: 'ظاہری شکل',
              description: 'ایپ کی شکل و صورت کو اپنی مرضی کے مطابق بنائیں۔',
              theme: {
                title: 'تھیم',
                description: 'ایప్ਲੀکیشن کے لیے ایک تھیم منتخب کریں۔',
                light: 'روشنی',
                dark: 'تاریک',
                system: 'سسٹم',
              },
              language: {
                title: 'زبان',
                description: 'اپنی पसंदीदा زبان منتخب کریں۔',
                selectPlaceholder: 'زبان منتخب کریں',
              },
            },
          },
      }
    }
  });

export default i18n;
