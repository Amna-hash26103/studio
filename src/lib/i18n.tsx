
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translateText } from '@/ai/flows/translate-text-flow';

// Define available languages
export const languages = [
    { code: 'en', name: 'English' },
    { code: 'ur', name: 'Urdu (اردو)' },
    { code: 'ur-RO', name: 'Roman Urdu' },
    { code: 'pa', name: 'Punjabi (پنجابی)' },
    { code: 'ps', name: 'Pashto (پښتو)' },
    { code: 'skr', name: 'Saraiki (سرائیکی)' },
];

// English translations object
const en = {
    common: {
        friend: 'friend',
        loading: 'Loading',
        error: 'Error',
        cancel: 'Cancel',
        save: 'Save',
        saving: 'Saving...',
    },
    landing: {
        login: 'Log In',
        signup: 'Sign Up',
        hero: {
            title: 'Empower Your Journey. Together.',
            subtitle: 'FEMMORA is a sanctuary for women to connect, share, and flourish. Explore wellness, creativity, and community in a space designed for you.',
            cta: 'Join the Community',
        },
        thrive: {
            title: 'A Space to Thrive.',
            subtitle: 'At FEMMORA, we believe in the power of collective strength. Our platform is more than just an app; it\'s a movement dedicated to celebrating and supporting every woman\'s unique path to wellness and success.',
        },
        features: {
            title: 'Features Designed for You.',
            subtitle: 'Everything you need to support your personal and professional growth, all in one place.',
            soulspace: {
                title: "SoulSpace: Emotional Wellness Companion",
                description: "A safe digital haven where emotions are met with empathy. Whether you’re overwhelmed, reflective, or healing, SoulSpace listens — offering guided reflections, gentle prompts, and supportive AI companions who speak your heart’s language.",
            },
            herhealth: {
                title: "HerHealth: Smart Health Insights",
                description: "Track your cycles, sleep, and stress in one serene space. HerHealth uses adaptive AI to understand you — recommending lifestyle tweaks, reminders, and supportive routines that honor your body’s rhythm.",
            },
            nourish: {
                title: "Nourish: Personalized Diet & Nutrition Guide",
                description: "Built for every woman’s journey — from strength to self-care. Nourish curates meal suggestions that match your mood, health goals, and culture. Each recommendation comes from a place of love, not restriction.",
            },
            evolve: {
                title: "Evolve: Gentle Fitness & Energy Flow",
                description: "Move at your pace — yoga, mindful movement, and women-focused workouts guided by your energy levels and emotional state. Every motion in Evolve celebrates what your body can do, not what it must.",
            },
            circle: {
                title: "Circle: The FEMMORA Community",
                description: "A beautifully moderated space for women to connect, share stories, and lift one another. From daily check-ins to creative challenges, Circle celebrates unity without comparison — a digital sisterhood of strength.",
            },
            femmind: {
                title: "FEMMind: Your AI-Guided Growth Partner",
                description: "Three fine-tuned, empathetic LLMs — customized to support Health, Emotional Wellness, and Life Guidance. They don’t just respond — they understand, blending science with empathy to offer advice that uplifts, not instructs.",
            },
        },
        footer: {
            rights: 'All rights reserved.',
            privacy: 'Privacy',
            terms: 'Terms',
            contact: 'Contact',
        }
    },
    sidebar: {
        welcome: 'Welcome back,',
        feed: 'Feed',
        healthcare: 'Healthcare',
        emotionalHealth: 'Emotional Health',
        diet: 'Diet',
        periodTracker: 'Period Tracker',
        main: 'MAIN',
        account: 'ACCOUNT',
        settings: 'Settings',
        logout: 'Log Out',
        health: 'Health',
    },
    appShell: {
        logoutSuccessTitle: "Logged Out",
        logoutSuccessDescription: "You have been successfully logged out.",
        logoutError: "Could not log you out. Please try again.",
        selectLanguage: "Select language",
        notifications: "Notifications",
        notification1: {
            title: "New post from Chloe! ✨",
            description: '"Cycle syncing my workouts has been a game-changer!..."',
        },
        notification2: {
            title: "Hydration Reminder 💧",
            description: "Don't forget to drink some water.",
        },
        notification3: {
            title: "New post from Elena!",
            description: '"Just finished a 7-day mindfulness challenge..."',
        },
    },
    feed: {
        posts: 'Posts',
        postPlaceholder: "What's on your mind, {{name}}?",
        postButton: 'Post',
        firestoreError: 'Could not load live posts. Displaying demo content.',
        translated: 'Translated',
        translate: 'Translate',
        showOriginal: 'Show Original',
        translateTo: 'Translate to {{language}}',
        share: 'Share',
        commentPlaceholder: 'Write a comment...',
    },
    emotionalHealth: {
        title: 'Navigating Sadness',
        subtitle: 'A safe space to explore your feelings and find a path forward.',
        initialMessage: "Hello. It's okay to not be okay. If you feel like talking, I'm here to listen.",
    },
    healthcare: {
        title: 'Healthcare AI',
        subtitle: 'Your personal guide for physical health and well-being.',
        initialMessage: "Hello! I'm your Femmora Health Companion. You can ask me about female hygiene, menstrual health, pregnancy, and other wellness topics. How can I help you today?",
    },
    chat: {
        placeholders: {
            health: "e.g., How can I do a breast self-exam?",
            emotionalWellbeing: "e.g., I've been feeling down lately...",
            nutrition: "e.g., What are some healthy snack ideas?",
        },
        initialMessages: {
            health: "Hi! I'm your Healthcare assistant. How can I help you today?",
            emotionalWellbeing: "Hello. It's okay to not be okay. If you feel like talking, I'm here to listen.",
            nutrition: "Hey there! I'm your Diet guide. Ask me anything about healthy eating!",
        },
        errorMessage: "I'm sorry, something went wrong. Please try again later.",
    },
    supportBot: {
        toggleAriaLabel: 'Toggle support chat',
        title: 'Your support guide',
        initialError: "Hey! Having some trouble getting started, but I'm here. What's up?",
        errorMessage: "Oops, seems like I'm having a moment. Could you try that again?",
        placeholder: 'Ask {{botName}} anything...',
    },
    diet: {
        title: 'Diet & Digestion',
        subtitle: 'Track your meals, hydration, and digestive health.',
        mealLoggedTitle: 'Meal Logged!',
        mealLoggedDescription: 'Your meal and its nutritional info have been saved locally.',
        analysisFailedTitle: 'Analysis Failed',
        analysisFailedDescription: "We couldn't analyze your meal right now. Please try again.",
        bowelMovementLoggedTitle: 'Bowel Movement Logged',
        bowelMovementLoggedDescription: "You've logged a Type {{type}} movement.",
        logMealTitle: 'Log a Meal',
        logMealDescription: 'Describe what you ate, and our AI will estimate the nutritional content.',
        mealDescriptionLabel: 'Meal Description',
        mealDescriptionPlaceholder: 'e.g., A bowl of oatmeal with blueberries and almonds',
        analyzingButton: 'Analyzing...',
        analyzeAndLogButton: 'Analyze & Log Meal',
        askDietGuideTitle: 'Ask Your Diet Guide',
        askDietGuideDescription: 'Have questions about nutrition? Ask your AI assistant below.',
        waterTrackerTitle: 'Water Intake',
        waterTrackerDescription: 'Log your daily water intake. Aim for 8 glasses a day!',
        glasses: 'glasses',
        poopTrackerTitle: 'Bowel Movement Tracker',
        poopTrackerDescription: 'Log your movements using the Bristol Stool Chart.',
        poopTrackerPlaceholder: 'Log a new movement...',
        bristolScale: {
            type1: 'Type 1: Separate hard lumps',
            type2: 'Type 2: Lumpy and sausage-like',
            type3: 'Type 3: Sausage shape with cracks',
            type4: 'Type 4: Smooth, soft sausage',
            type5: 'Type 5: Soft blobs with clear edges',
            type6: 'Type 6: Mushy, ragged edges',
            type7: 'Type 7: Liquid consistency',
        },
        todaysLogs: "Today's Logs",
        logType: 'Type {{type}}',
        noMovementsLogged: 'No movements logged today.',
        mealHistoryTitle: 'Meal History',
        noMealsLogged: "You haven't logged any meals yet. Add one above to get started!",
        justNow: 'Just now',
        nutrition: {
            calories: 'Calories',
            protein: 'Protein',
            carbs: 'Carbs',
            fat: 'Fat',
            fiber: 'Fiber',
        },
    },
    settings: {
        title: 'Settings',
        subtitle: 'Manage your profile, account, and app preferences.',
        profile: {
            title: 'Profile',
            description: 'This is how others will see you on the site.',
            coverPhotoLabel: 'Cover Photo',
            noCoverSelected: 'No cover selected',
            profilePictureLabel: 'Profile Picture',
            displayNameLabel: 'Display Name',
            displayNamePlaceholder: 'Your full name',
            bioLabel: 'Bio',
            bioPlaceholder: 'Tell us a little about yourself',
            locationLabel: 'Location',
            locationPlaceholder: 'Where are you in the world?',
            updateSuccessTitle: 'Profile Updated!',
            updateSuccessDescription: 'Your changes have been saved successfully.',
            updateFailedTitle: 'Update failed',
            updateFailedDescription: 'There was a problem saving your profile. Please try again.',
        },
        account: {
            title: 'Account',
            description: 'Manage your account details.',
            emailLabel: 'Email',
            passwordLabel: 'Password',
            changePasswordButton: 'Change Password',
        },
        appearance: {
            title: 'Appearance',
            description: 'Customize the look and feel of the app.',
            theme: {
                title: 'Theme',
                description: 'Choose how the app looks on your device.',
                light: 'Light',
                dark: 'Dark',
                system: 'System',
            },
        },
        chatbot: {
            title: 'Chatbot',
            description: 'Personalize your AI support assistant.',
            nameLabel: 'Chatbot Name',
            saveButton: 'Save Name',
            saveSuccessTitle: 'Chatbot name saved!',
            saveSuccessDescription: 'Your support assistant is now named {{botName}}.',
        },
    },
    periodTracker: {
        title: 'Cycle Tracker',
        subtitle: 'Track your menstrual cycle to understand your body better.',
        invalidDateTitle: 'Invalid Date',
        invalidDateDescription: "You can't select a date before your current cycle started.",
        futureDateTitle: 'Future Date',
        futureDateDescription: 'You can log your flow for today or past days.',
        periodLoggedTitle: 'Period Logged',
        newCycleSuccess: 'Your new cycle has been successfully recorded.',
        newCycleError: 'Could not start new cycle.',
        endDateErrorTitle: 'End Date Error',
        endDateErrorDescription: 'End date cannot be before the start date.',
        periodEndedTitle: 'Period Ended',
        endCycleSuccess: 'Your cycle has been successfully ended.',
        endCycleError: 'Could not end cycle.',
        logSavedTitle: 'Daily log saved!',
        logSavedError: 'Could not save daily log.',
        logPeriodTitle: 'Log Your Period',
        logPeriodDescription: 'Select a day to start, end, or log your flow.',
        activeCycleStart: 'Active cycle started on {{date}}',
        startCycleDialog: {
            title: 'Start New Cycle?',
            description: 'Do you want to start a new period cycle on {{date}}?',
            activeCycleWarning: 'This will end your current active cycle.',
            startButton: 'Start Cycle',
        },
        endCycleDialog: {
            title: 'End Current Cycle?',
            description: 'Do you want to end your current cycle on {{date}}? You can also log your flow for this day.',
            logFlowButton: 'Log Flow',
            endButton: 'End Cycle',
        },
        logFlowDialog: {
            title: 'Log Flow',
            description: 'Log your menstrual flow for {{date}}',
            flowLabel: 'Flow',
            notesLabel: 'Notes (optional)',
            notesPlaceholder: 'e.g., cramps, fatigue, etc.',
        },
        flow: {
            spotting: 'Spotting',
            light: 'Light',
            medium: 'Medium',
            heavy: 'Heavy',
        },
        stats: {
            title: 'Your Cycle Stats',
            description: 'An overview of your menstrual cycle patterns.',
            noStatsDescription: 'Log at least two full cycles to see your stats and predictions.',
            noStatsYet: 'No stats to show yet.',
            days: 'days',
            avgCycleLength: 'Average Cycle Length',
            avgPeriodLength: 'Average Period Length',
            predictedNextPeriod: 'Predicted Next Period',
            notApplicable: 'N/A',
            cycleLengthHistory: 'Cycle Length History',
            periodDurationHistory: 'Period Duration History',
            durationLabel: 'Duration (Days)',
            lengthLabel: 'Length (Days)',
            daysCount: '{{count}} days'
        },
        bleedingHistory: {
            title: 'Bleeding History',
            noCompletedCycles: 'No completed cycles yet. Log your first period to get started!',
            cycle: 'Cycle #{{index}}',
            ongoing: 'Ongoing',
            duration: 'Duration',
            flowPattern: 'Flow Pattern',
            notes: 'Notes',
            noLogs: 'No daily logs for this cycle.',
        }
    },
};

type Translations = typeof en;

const LanguageContext = createContext<{
  lang: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}>({
  lang: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const useTranslation = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [translations, setTranslations] = useState<Translations>(en);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };
  
  const translateKey = useCallback(async (key: string, value: string, targetLang: string, cache: Record<string, string>) => {
    const cacheKey = `${targetLang}_${key}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    const { translatedText } = await translateText({ text: value, targetLanguage: targetLang });
    cache[cacheKey] = translatedText;
    return translatedText;
  }, []);

  const translateAll = useCallback(async (targetLang: string) => {
    if (targetLang === 'en') {
      setTranslations(en);
      sessionStorage.removeItem('translations');
      return;
    }

    const cachedTranslations = sessionStorage.getItem(`translations_${targetLang}`);
    if (cachedTranslations) {
      setTranslations(JSON.parse(cachedTranslations));
      return;
    }

    const newTranslations: any = JSON.parse(JSON.stringify(en));
    const translationCache: Record<string, string> = {};

    const translationPromises: Promise<void>[] = [];

    const traverse = (obj: any, path: string[]) => {
      Object.keys(obj).forEach(key => {
        const currentPath = [...path, key];
        const fullKey = currentPath.join('.');
        if (typeof obj[key] === 'string') {
          translationPromises.push(
            (async () => {
              const translated = await translateKey(fullKey, obj[key], targetLang, translationCache);
              let nested = newTranslations;
              for (let i = 0; i < currentPath.length - 1; i++) {
                nested = nested[currentPath[i]];
              }
              nested[currentPath[currentPath.length - 1]] = translated;
            })()
          );
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key], currentPath);
        }
      });
    };

    traverse(en, []);
    await Promise.all(translationPromises);
    setTranslations(newTranslations);
    sessionStorage.setItem(`translations_${targetLang}`, JSON.stringify(newTranslations));
  }, [translateKey]);


  useEffect(() => {
    translateAll(lang);
  }, [lang, translateAll]);

  const t = useCallback((key: string, options?: { [key: string]: string | number }) => {
    let translation = getNestedValue(translations, key);
    if (typeof translation !== 'string') {
      console.warn(`Translation not found for key: ${key}`);
      // Fallback to English
      translation = getNestedValue(en, key);
      if(typeof translation !== 'string') return key;
    }

    if (options) {
      Object.keys(options).forEach(optionKey => {
        translation = translation.replace(`{{${optionKey}}}`, String(options[optionKey]));
      });
    }
    return translation;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage: setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
