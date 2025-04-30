import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Log les valeurs d'environnement pour le débogage (sans révéler les valeurs complètes)
console.log('Firebase config status:', {
  apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY ? 'défini' : 'non défini',
  authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'défini' : 'non défini',
  projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'défini' : 'non défini',
  storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? 'défini' : 'non défini',
  messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? 'défini' : 'non défini',
  appId: !!import.meta.env.VITE_FIREBASE_APP_ID ? 'défini' : 'non défini',
  measurementId: !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? 'défini' : 'non défini'
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialiser les services Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialiser Storage avec des options spécifiques
const storage = getStorage(app, firebaseConfig.storageBucket);
console.log('Storage configuration:', {
  bucket: storage.app.options.storageBucket,
  projectId: storage.app.options.projectId,
  customAuthDomain: storage.app.options.authDomain,
  config: firebaseConfig
});

let analytics;

// Initialiser Analytics seulement si supporté par le navigateur
const initAnalytics = async () => {
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialisé avec succès');
    } else {
      console.log('Firebase Analytics n\'est pas pris en charge dans cet environnement');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase Analytics:', error);
  }
};

initAnalytics();

// Exports
export { auth, db, storage, analytics };
export default app; 