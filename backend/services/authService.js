const { auth } = require('../config/firebase');
const jwt = require('jsonwebtoken');

const authService = {
  // Créer un nouvel utilisateur
  async createUser(email, password, userData) {
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: userData.name,
        photoURL: userData.profileImage
      });

      // Créer le profil utilisateur dans Firestore
      await db.collection('users').doc(userRecord.uid).set({
        ...userData,
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return userRecord;
    } catch (error) {
      throw new Error('Erreur lors de la création de l\'utilisateur: ' + error.message);
    }
  },

  // Connecter un utilisateur
  async loginUser(email, password) {
    try {
      // Vérifier les identifiants
      const userRecord = await auth.getUserByEmail(email);
      
      // Générer un token JWT
      const token = jwt.sign(
        { uid: userRecord.uid },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        token,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName,
          profileImage: userRecord.photoURL
        }
      };
    } catch (error) {
      throw new Error('Erreur lors de la connexion: ' + error.message);
    }
  },

  // Récupérer un utilisateur par son ID
  async getUserById(uid) {
    try {
      const userRecord = await auth.getUser(uid);
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        throw new Error('Utilisateur non trouvé');
      }

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        profileImage: userRecord.photoURL,
        ...userDoc.data()
      };
    } catch (error) {
      throw new Error('Erreur lors de la récupération de l\'utilisateur: ' + error.message);
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(uid, userData) {
    try {
      // Mettre à jour dans Firebase Auth
      await auth.updateUser(uid, {
        displayName: userData.name,
        photoURL: userData.profileImage
      });

      // Mettre à jour dans Firestore
      await db.collection('users').doc(uid).update({
        ...userData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return await this.getUserById(uid);
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur: ' + error.message);
    }
  },

  // Supprimer un utilisateur
  async deleteUser(uid) {
    try {
      await auth.deleteUser(uid);
      await db.collection('users').doc(uid).delete();
      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      throw new Error('Erreur lors de la suppression de l\'utilisateur: ' + error.message);
    }
  }
};

module.exports = authService; 