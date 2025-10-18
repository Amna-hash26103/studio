'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// This is a placeholder for the Firebase config. The actual values will be
// populated by a script that runs when the application starts, reading from
// environment variables. This setup is crucial for Vercel deployments where
// client-side code cannot directly access `process.env` at runtime.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    // We are in the browser
    if (!window.firebaseConfig) {
      console.error("Firebase config not found. Make sure /public/firebase-config.js is loaded.");
      return getDummySdks();
    }
    if (!getApps().length) {
      const firebaseApp = initializeApp(window.firebaseConfig);
      return getSdks(firebaseApp);
    }
    return getSdks(getApp());
  } 
  
  // We are on the server, try to initialize for App Hosting
  if (!getApps().length) {
    try {
      const firebaseApp = initializeApp({});
      return getSdks(firebaseApp);
    } catch(e) {
      console.warn("Automatic initialization failed. Falling back to firebase config object.", e);
      if (!firebaseConfig.apiKey) {
        console.error("Firebase config is not set. Firebase will not be initialized on the server.");
        return getDummySdks();
      }
      const serverApp = initializeApp(firebaseConfig);
      return getSdks(serverApp);
    }
  }
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  try {
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp),
      storage: getStorage(firebaseApp),
    };
  } catch (e) {
    console.error("Error getting Firebase SDKs. This might happen if config is invalid.", e);
    return getDummySdks();
  }
}

// Helper function to return dummy SDKs to prevent app crashes when config is missing
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
