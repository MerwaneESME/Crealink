const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = require('../serviceAccountKey.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.log('Firebase déjà initialisé');
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth }; 