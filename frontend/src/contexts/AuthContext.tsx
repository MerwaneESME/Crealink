import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Types d'utilisateur
export type UserRole = 'admin' | 'creator' | 'expert';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

// Utilisateur admin par défaut pour la démonstration
const adminUser: User = {
  id: 'user-1',
  name: 'Admin',
  email: 'admin@crealink.com',
  role: 'admin',
  avatar: '',
  bio: 'Administrateur de la plateforme Crealink',
  createdAt: '2025-01-01T00:00:00.000Z',
  verified: true
};

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider pour le contexte d'authentification
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si un utilisateur est déjà connecté
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Récupérer les informations d'utilisateur depuis le localStorage
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (savedUser && token) {
          // En situation réelle, vous devriez vérifier la validité du token auprès du backend
          setUser(JSON.parse(savedUser));
        } else {
          // Pour la démonstration, nous utilisons l'utilisateur admin par défaut
          // Enlever ceci en production
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          localStorage.setItem('token', 'demo-token');
        }
      } catch (err) {
        console.error('Erreur de vérification d\'authentification:', err);
        setError('Erreur lors de la vérification de l\'authentification');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // En situation réelle, vous feriez un appel à votre API ici
      // Pour la démonstration, nous vérifions simplement les identifiants de l'admin
      if (email === 'admin@crealink.com' && password === 'password') {
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('token', 'demo-token');
      } else {
        throw new Error('Identifiants invalides');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur s\'est produite lors de la connexion');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      setLoading(true);
      setError(null);

      // En situation réelle, vous feriez un appel à votre API ici
      // Pour la démonstration, nous simulons une inscription
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || 'Utilisateur',
        email: userData.email || '',
        role: userData.role || 'creator',
        avatar: userData.avatar || '',
        bio: userData.bio || '',
        createdAt: new Date().toISOString(),
        verified: false
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', 'demo-token');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur s\'est produite lors de l\'inscription');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);

      // En situation réelle, vous feriez un appel à votre API ici
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error('Aucun utilisateur connecté');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur s\'est produite lors de la mise à jour du profil');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}; 