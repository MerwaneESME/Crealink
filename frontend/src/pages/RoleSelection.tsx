import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { motion } from 'framer-motion';

const RoleSelection = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelection = async (role: 'expert' | 'creator') => {
    if (!user) return;
    
    try {
      setLoading(true);
      await authService.updateUserRole(user.uid, role);
      await refreshUser();
      navigate('/onboarding-form');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      setError(error.message || "Une erreur est survenue lors de la sélection du rôle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg shadow-purple-500/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Choisissez votre rôle
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Sélectionnez le rôle qui vous correspond le mieux
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2 p-6">
            <Button
              variant="outline"
              className="h-auto p-6 bg-black/40 border-purple-500/20 hover:bg-purple-900/20 hover:border-purple-500/40 transition-all duration-200"
              onClick={() => handleRoleSelection('expert')}
              disabled={loading}
            >
              <div className="flex flex-col items-center text-center max-w-[200px]">
                <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-white">Expert</h2>
                <p className="text-gray-400 text-sm">
                  Professionnel qualifié
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 bg-black/40 border-purple-500/20 hover:bg-purple-900/20 hover:border-purple-500/40 transition-all duration-200"
              onClick={() => handleRoleSelection('creator')}
              disabled={loading}
            >
              <div className="flex flex-col items-center text-center max-w-[200px]">
                <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-white">Créateur</h2>
                <p className="text-gray-400 text-sm">
                  Créez du contenu
                </p>
              </div>
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {error && (
              <div className="text-red-500 text-sm text-center w-full">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
                <p className="text-gray-400">Mise à jour en cours...</p>
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RoleSelection; 