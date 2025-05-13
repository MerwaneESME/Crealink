import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Question {
  id: string;
  text: string;
  type: 'radio' | 'checkbox' | 'text' | 'select' | 'textarea' | 'socialLinks' | 'tags' | 'experienceList';
  options?: string[];
  required: boolean;
  placeholder?: string;
  fields?: Array<{
    id: string;
    label: string;
    placeholder: string;
  }>;
}

interface Step {
  id: string;
  title: string;
  questions: Question[];
}

const expertSteps: Step[] = [
  {
    id: 'expertise',
    title: 'Questions sur ton expertise',
    questions: [
      {
        id: 'presentation',
        text: 'Présente-toi et explique ton domaine d\'expertise',
        type: 'textarea',
        required: true
      },
      {
        id: 'skills',
        text: 'Sélectionne tes compétences',
        type: 'tags',
        required: true,
        options: [
          'Photoshop',
          'Adobe Premiere Pro',
          'Adobe After Effects',
          'Illustrator',
          'InDesign',
          'Motion Design',
          'Montage vidéo',
          'Graphisme',
          'Animation 3D',
          'Sound Design'
        ]
      },
      {
        id: 'experiences',
        text: 'Ajoute tes expériences',
        type: 'experienceList',
        required: true,
        placeholder: 'Ex: Participation à la vidéo de Squeezie'
      }
    ]
  }
];

const creatorSteps: Step[] = [
  {
    id: 'personal',
    title: 'Informations personnelles',
    questions: [
      {
        id: 'socialLinks',
        text: 'Liens de vos réseaux sociaux',
        type: 'socialLinks',
        required: true,
        fields: [
          { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@votre-chaine' },
          { id: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/votre-chaine' },
          { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/votre-compte' }
        ]
      }
    ]
  },
  {
    id: 'content',
    title: 'Questions sur ton contenu',
    questions: [
      {
        id: 'description',
        text: 'Décris-toi et ton contenu',
        type: 'textarea',
        required: true
      },
      {
        id: 'skills',
        text: 'Sélectionne tes compétences',
        type: 'tags',
        required: true,
        options: [
          'Créateur de contenu gaming',
          'Vlog',
          'Histoire',
          'Beauté',
          'Mode',
          'Cuisine',
          'Tech',
          'Lifestyle',
          'Sport',
          'Musique'
        ]
      },
      {
        id: 'publishingFrequency',
        text: 'À quelle fréquence publies-tu et sur quelles plateformes',
        type: 'textarea',
        required: true
      },
      {
        id: 'challenges',
        text: 'Quels sont les plus gros défis que tu rencontres dans la création de contenu ?',
        type: 'textarea',
        required: true
      },
      {
        id: 'previousCollaborations',
        text: 'As-tu déjà collaboré avec des monteurs, graphistes ou autres spécialistes ? Raconte ton expérience.',
        type: 'textarea',
        required: true
      },
      {
        id: 'neededServices',
        text: 'Quels types de services ou de profils recherches-tu pour t\'accompagner dans tes projets ?',
        type: 'textarea',
        required: true
      },
      {
        id: 'goals',
        text: 'Quels sont tes objectifs en t\'inscrivant sur cette plateforme ?',
        type: 'textarea',
        required: true
      }
    ]
  }
];

const OnboardingForm = () => {
  const { user, updateUserProfile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userType, setUserType] = useState<'expert' | 'creator' | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Récupérer le rôle de l'utilisateur au chargement
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        // Récupérer les données utilisateur de Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Définir le type d'utilisateur en fonction du rôle stocké
          if (userData.role === 'expert') {
            setUserType('expert');
          } else if (userData.role === 'creator' || userData.role === 'influencer') {
            setUserType('creator');
          }
        }
      }
    };
    
    fetchUserRole();
  }, [user]);

  const steps = userType === 'expert' ? expertSteps : creatorSteps;
  const totalQuestions = steps.reduce((acc: number, step: Step) => acc + step.questions.length, 0);
  const currentStep = steps[stepIndex];
  const currentQuestion = currentStep?.questions[questionIndex];
  const currentQuestionNumber = steps.slice(0, stepIndex).reduce((acc: number, step: Step) => acc + step.questions.length, 0) + questionIndex + 1;
  const progress = (currentQuestionNumber / totalQuestions) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (questionIndex < currentStep.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      setQuestionIndex(0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    } else if (stepIndex > 0) {
      const prevStep = steps[stepIndex - 1];
      setStepIndex(stepIndex - 1);
      setQuestionIndex(prevStep.questions.length - 1);
    } else {
      // Si on est à la première question de la première étape, retourner à la sélection de rôle
      navigate("/role-selection");
    }
  };

  const handleSubmit = async () => {
    if (!user || !userType) return;
    setLoading(true);
    try {
      // Préparer un objet avec uniquement les données valides
      let userData: Record<string, any> = {
        ...answers,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      };

      // Ajouter les champs spécifiques selon le type d'utilisateur
      if (userType === 'creator') {
        // Réseaux sociaux
        userData.socials = {
          youtube: answers.youtube || '',
          twitch: answers.twitch || '',
          instagram: answers.instagram || ''
        };
        userData.youtube = answers.youtube || '';
        userData.twitch = answers.twitch || '';
        userData.instagram = answers.instagram || '';
        
        // Description
        userData.description = answers.description || '';
        userData.bio = answers.description || '';
        
        // Compétences
        userData.skills = answers.skills || [];
        
        // Autres champs pour créateurs
        userData.publishingFrequency = answers.publishingFrequency || '';
        userData.challenges = answers.challenges || '';
        userData.previousCollaborations = answers.previousCollaborations || '';
        userData.neededServices = answers.neededServices || '';
        userData.goals = answers.goals || '';
        
        // S'assurer que le displayName est correctement défini
        userData.displayName = user.displayName || user.name || '';
      } else {
        // Expert
        userData.expertise = answers.expertise || answers.presentation || '';
        userData.description = answers.description || answers.presentation || '';
        userData.bio = answers.description || answers.presentation || '';
        
        // Compétences
        userData.skills = answers.skills || [];
        
        // Expériences
        userData.experiences = answers.experiences || [];
        
        // S'assurer que le displayName est correctement défini
        userData.displayName = user.displayName || user.name || '';
      }

      console.log('Données à enregistrer:', userData);
      
      // Utiliser setDoc avec merge: true pour préserver les autres champs
      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      
      // Rafraîchir explicitement les données utilisateur
      await refreshUser();
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'est pas encore chargé ou le type n'est pas déterminé
  if (!user || !userType || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md p-6 bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg shadow-purple-500/10">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Chargement...
          </h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 flex flex-col items-center p-4 pt-24">
      <div className="w-full max-w-2xl mb-8">
        <Progress value={progress} className="h-2 bg-purple-900/30" />
        <div className="flex justify-between mt-2 text-sm text-gray-400">
          <span>Question {currentQuestionNumber} sur {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
      <Card className="w-full max-w-2xl p-6 bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg shadow-purple-500/10">
        <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          {currentStep.title}
        </h2>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <Label className="text-xl text-gray-300">{currentQuestion.text}</Label>
            {currentQuestion.type === 'select' && (
              <select
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="w-full p-2 bg-black/50 border border-purple-500/20 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="">Sélectionnez une option</option>
                {currentQuestion.options?.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
            {currentQuestion.type === 'checkbox' && (
              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.options?.map((option) => (
                  <label key={option} className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={answers[currentQuestion.id]?.includes(option) || false}
                      onChange={(e) => {
                        const current = answers[currentQuestion.id] || [];
                        const newValue = e.target.checked
                          ? [...current, option]
                          : current.filter((item: string) => item !== option);
                        handleAnswer(currentQuestion.id, newValue);
                      }}
                      className="rounded border-purple-500/20 text-purple-500 focus:ring-purple-500/50"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
            {currentQuestion.type === 'text' && (
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="w-full p-2 bg-black/50 border border-purple-500/20 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            )}
            {currentQuestion.type === 'textarea' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="w-full p-2 bg-black/50 border border-purple-500/20 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            )}
            {currentQuestion.type === 'socialLinks' && (
              <div className="space-y-4">
                {currentQuestion.fields?.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                      id={field.id}
                      type="url"
                      placeholder={field.placeholder}
                      value={answers[field.id] || ""}
                      onChange={(e) => handleAnswer(field.id, e.target.value)}
                      className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50"
                      required={currentQuestion.required}
                    />
                  </div>
                ))}
              </div>
            )}
            {currentQuestion.type === 'tags' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options?.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={answers[currentQuestion.id]?.includes(option) ? "default" : "outline"}
                      onClick={() => {
                        const currentTags = answers[currentQuestion.id] || [];
                        const newTags = currentTags.includes(option)
                          ? currentTags.filter((tag: string) => tag !== option)
                          : [...currentTags, option];
                        handleAnswer(currentQuestion.id, newTags);
                      }}
                      className={`${
                        answers[currentQuestion.id]?.includes(option)
                          ? "bg-purple-600 text-white"
                          : "border-purple-500/20 text-gray-300 hover:bg-purple-900/30"
                      }`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {currentQuestion.type === 'experienceList' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {answers[currentQuestion.id]?.map((exp: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={exp}
                        onChange={(e) => {
                          const newExps = [...answers[currentQuestion.id]];
                          newExps[index] = e.target.value;
                          handleAnswer(currentQuestion.id, newExps);
                        }}
                        className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newExps = answers[currentQuestion.id].filter((_: string, i: number) => i !== index);
                          handleAnswer(currentQuestion.id, newExps);
                        }}
                        className="border-red-500/20 text-red-300 hover:bg-red-900/30"
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentExps = answers[currentQuestion.id] || [];
                    handleAnswer(currentQuestion.id, [...currentExps, ""]);
                  }}
                  className="border-purple-500/20 text-gray-300 hover:bg-purple-900/30"
                >
                  Ajouter une expérience
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <div className="flex justify-between mt-8">
          <Button
            onClick={handleBack}
            className="border-purple-500/30 text-white hover:bg-purple-900/30 hover:text-white transition-all duration-300"
          >
            Retour
          </Button>
          {(stepIndex === steps.length - 1 && questionIndex === currentStep.questions.length - 1) ? (
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