'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // Check if we are in a browser environment where 'window' is available
  const isBrowser = typeof window !== 'undefined';

  if (!getApps().length) {
    if (isBrowser) {
      // CLIENT-SIDE: Use the config from the script loaded in the browser
      const firebaseConfig = (window as any).firebaseConfig;

      if (!firebaseConfig || !firebaseConfig.apiKey) {
        console.error("Firebase config not found. Make sure /public/firebase-config.js is loaded.");
        // We can't proceed without config on the client
        throw new Error("Firebase configuration is missing on the client.");
      }
      const firebaseApp = initializeApp(firebaseConfig);
      return getSdks(firebaseApp);

    } else {
      // SERVER-SIDE (build time): Use automatic initialization for hosting environments
      // This will succeed in environments like Firebase App Hosting.
      // For Vercel build, it will gracefully fail but allow the build to pass.
      try {
        const app = initializeApp();
        return getSdks(app);
      } catch (e) {
         console.warn("Server-side Firebase initialization failed during build. This is expected on Vercel and can be ignored.");
         // Return a dummy object to prevent further errors during build
         return getDummySdks();
      }
    }
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

// Helper function to return dummy SDKs during server-side build on Vercel
function getDummySdks() {
    const dummyApp = { name: 'dummy', options: {}, automaticDataCollectionEnabled: false };
    return {
        firebaseApp: dummyApp as FirebaseApp,
        auth: {} as Auth,
        firestore: {} as Firestore,
        storage: {} as FirebaseStorage,
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