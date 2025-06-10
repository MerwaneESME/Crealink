import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Configuration Firebase directe (à utiliser si les variables d'environnement ne sont pas définies)
const firebaseConfigDirect = {
  apiKey: "AIzaSyCtRMoOul2RXspmGLb-r6msiP3tIgx3t2I",
  authDomain: "crealink-46c13.firebaseapp.com",
  projectId: "crealink-46c13",
  storageBucket: "crealink-46c13.firebasestorage.app",
  messagingSenderId: "587291493705",
  appId: "1:587291493705:web:ac2db39210b5587a718698",
  measurementId: "G-LTZ628KLJE"
};

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

// Utiliser les variables d'environnement si disponibles, sinon utiliser la configuration directe
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigDirect.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigDirect.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigDirect.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigDirect.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigDirect.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigDirect.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigDirect.measurementId
};

// Initialiser les services Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configurer la persistance de l'authentification
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistance de l\'authentification configurée avec succès');
  })
  .catch((error) => {
    console.error('Erreur lors de la configuration de la persistance:', error);
  });

// Configurer le provider Google
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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
export { auth, db, storage, analytics, googleProvider };
export default app; 