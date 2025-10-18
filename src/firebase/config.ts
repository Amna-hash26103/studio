

// This configuration is used for local development and as a fallback.
// For production deployments on Vercel, these values should be set as environment variables.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC6gIyIZGMaF8jhpuy4WqNGBF5yjWcn9zk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-3289594806-e28aa.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-3289594806-e28aa",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-3289594806-e28aa.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "282325221759",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:282325221759:android:02461898cacb7b2be85a4a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


