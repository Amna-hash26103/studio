'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! The configuration is now expected to be on the window object
    // loaded from /public/firebase-config.js
    const firebaseConfig = (window as any).firebaseConfig;

    if (!firebaseConfig || !firebaseConfig.apiKey) {
      console.error("Firebase config not found. Make sure /public/firebase-config.js is loaded.");
      // Attempt to initialize via App Hosting as a fallback for that specific environment
      try {
        const app = initializeApp();
        return getSdks(app);
      } catch (e) {
         console.error("Automatic initialization also failed.", e);
         throw new Error("Firebase configuration is missing.");
      }
    }
    
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
