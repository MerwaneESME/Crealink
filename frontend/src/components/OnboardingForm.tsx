import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  id: string;
  text: string;
  type: 'radio' | 'checkbox' | 'text' | 'select';
  options?: string[];
  required: boolean;
}

interface Step {
  id: string;
  title: string;
  questions: Question[];
}

const expertSteps: Step[] = [
  {
    id: 'expertise',
    title: 'Votre Expertise',
    questions: [
      {
        id: 'mainExpertise',
        text: 'Quelle est votre principale expertise ?',
        type: 'select',
        options: ['Photographe', 'Vidéaste', 'Graphiste', 'Développeur', 'Rédacteur', 'Autre'],
        required: true
      },
      {
        id: 'secondaryExpertise',
        text: 'Avez-vous d\'autres expertises ?',
        type: 'checkbox',
        options: ['Photographie', 'Vidéo', 'Graphisme', 'Développement', 'Rédaction', 'Montage', 'Animation', 'Design'],
        required: false
      }
    ]
  },
  {
    id: 'experience',
    title: 'Votre Expérience',
    questions: [
      {
        id: 'yearsExperience',
        text: 'Depuis combien d\'années exercez-vous ?',
        type: 'select',
        options: ['Moins d\'un an', '1-3 ans', '3-5 ans', '5-10 ans', 'Plus de 10 ans'],
        required: true
      },
      {
        id: 'portfolio',
        text: 'Avez-vous un portfolio ou des exemples de travaux ?',
        type: 'text',
        required: false
      }
    ]
  },
  {
    id: 'availability',
    title: 'Votre Disponibilité',
    questions: [
      {
        id: 'workType',
        text: 'Quel type de travail préférez-vous ?',
        type: 'checkbox',
        options: ['Temps plein', 'Temps partiel', 'Projets ponctuels', 'Freelance'],
        required: true
      },
      {
        id: 'rate',
        text: 'Quel est votre taux journalier moyen ?',
        type: 'select',
        options: ['Moins de 200€', '200-400€', '400-600€', '600-800€', 'Plus de 800€'],
        required: true
      }
    ]
  }
];

const creatorSteps: Step[] = [
  {
    id: 'platform',
    title: 'Vos Plateformes',
    questions: [
      {
        id: 'mainPlatform',
        text: 'Sur quelle plateforme êtes-vous le plus actif ?',
        type: 'select',
        options: ['YouTube', 'Instagram', 'TikTok', 'Twitch', 'Twitter', 'Autre'],
        required: true
      },
      {
        id: 'otherPlatforms',
        text: 'Sur quelles autres plateformes êtes-vous présent ?',
        type: 'checkbox',
        options: ['YouTube', 'Instagram', 'TikTok', 'Twitch', 'Twitter', 'LinkedIn', 'Facebook'],
        required: false
      }
    ]
  },
  {
    id: 'audience',
    title: 'Votre Audience',
    questions: [
      {
        id: 'followerCount',
        text: 'Combien d\'abonnés avez-vous au total ?',
        type: 'select',
        options: ['Moins de 1K', '1K-10K', '10K-50K', '50K-100K', '100K-500K', 'Plus de 500K'],
        required: true
      },
      {
        id: 'engagement',
        text: 'Quel est votre taux d\'engagement moyen ?',
        type: 'select',
        options: ['Moins de 1%', '1-3%', '3-5%', '5-10%', 'Plus de 10%'],
        required: true
      }
    ]
  },
  {
    id: 'content',
    title: 'Votre Contenu',
    questions: [
      {
        id: 'contentType',
        text: 'Quel type de contenu créez-vous ?',
        type: 'checkbox',
        options: ['Vidéos', 'Photos', 'Articles', 'Streams', 'Podcasts', 'Tutoriels', 'Revues'],
        required: true
      },
      {
        id: 'niche',
        text: 'Dans quelle niche êtes-vous spécialisé ?',
        type: 'text',
        required: true
      }
    ]
  }
];

const OnboardingForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<'expert' | 'creator' | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const steps = userType === 'expert' ? expertSteps : creatorSteps;
  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || !userType) return;

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...answers,
        userType,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg shadow-purple-500/10">
          <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Quel type d'utilisateur êtes-vous ?
          </h2>
          <div className="space-y-4">
            <Button
              onClick={() => setUserType('expert')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300"
            >
              Expert
            </Button>
            <Button
              onClick={() => setUserType('creator')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
            >
              Créateur de contenu
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestions = steps[currentStep].questions;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl mb-8">
        <Progress value={progress} className="h-2 bg-purple-900/30" />
        <div className="flex justify-between mt-2 text-sm text-gray-400">
          <span>Étape {currentStep + 1} sur {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <Card className="w-full max-w-2xl p-6 bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg shadow-purple-500/10">
        <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          {steps[currentStep].title}
        </h2>

        <div className="space-y-6">
          {currentQuestions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-gray-300">
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {question.type === 'select' && (
                <select
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="w-full p-2 bg-black/50 border border-purple-500/20 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="">Sélectionnez une option</option>
                  {question.options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}

              {question.type === 'checkbox' && (
                <div className="grid grid-cols-2 gap-2">
                  {question.options?.map((option) => (
                    <label key={option} className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={answers[question.id]?.includes(option) || false}
                        onChange={(e) => {
                          const current = answers[question.id] || [];
                          const newValue = e.target.checked
                            ? [...current, option]
                            : current.filter((item: string) => item !== option);
                          handleAnswer(question.id, newValue);
                        }}
                        className="rounded border-purple-500/20 text-purple-500 focus:ring-purple-500/50"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'text' && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="w-full p-2 bg-black/50 border border-purple-500/20 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="border-purple-500/30 text-white hover:bg-purple-900/30 hover:text-white transition-all duration-300"
          >
            Retour
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300"
            >
              {loading ? 'Enregistrement...' : 'Terminer'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300"
            >
              Suivant
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OnboardingForm; 