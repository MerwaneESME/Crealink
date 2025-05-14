import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'react-hot-toast';

const RoleSelection = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async (role: 'expert' | 'creator' | 'influencer') => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Mise à jour du rôle vers:', role);
      const updatedUser = await authService.updateUserRole(user.uid, role);
      console.log('Utilisateur mis à jour:', updatedUser);
      await refreshUser();
      console.log('Utilisateur rafraîchi');
      toast.success('Rôle mis à jour avec succès');
      navigate('/onboarding-form');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-8">Choisissez votre rôle</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center p-6 border rounded-lg hover:border-primary cursor-pointer"
               onClick={() => handleRoleSelection('expert')}>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Expert</h2>
            <p className="text-gray-600 text-center">
              Vous êtes un professionnel qualifié dans votre domaine
            </p>
          </div>

          <div className="flex flex-col items-center p-6 border rounded-lg hover:border-primary cursor-pointer"
               onClick={() => handleRoleSelection('creator')}>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Créateur de contenu</h2>
            <p className="text-gray-600 text-center">
              Vous créez du contenu et cherchez des experts
            </p>
          </div>
        </div>
        {loading && (
          <div className="mt-6 text-center">
            <p>Mise à jour en cours...</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RoleSelection; 