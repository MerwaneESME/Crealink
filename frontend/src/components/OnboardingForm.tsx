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
  type: 'radio' | 'checkbox' | 'text' | 'select' | 'textarea';
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
    id: 'personal',
    title: 'Informations personnelles',
    questions: [
      {
        id: 'firstName',
        text: 'Nom',
        type: 'text',
        required: true
      },
      {
        id: 'lastName',
        text: 'Prénom',
        type: 'text',
        required: true
      },
      {
        id: 'pseudo',
        text: 'Pseudo (nom professionnel)',
        type: 'text',
        required: true
      },
      {
        id: 'email',
        text: 'Adresse e-mail',
        type: 'text',
        required: true
      }
    ]
  },
  {
    id: 'expertise',
    title: 'Questions sur ton expertise',
    questions: [
      {
        id: 'presentation',
        text: 'Présente toi et explique ton domaine d\'expertise',
        type: 'textarea',
        required: true
      },
      {
        id: 'experience',
        text: 'Parle de ton expérience : depuis combien de temps tu exerces, pour qui tu as travaillé, etc',
        type: 'textarea',
        required: true
      },
      {
        id: 'preferredProjects',
        text: 'Quels types de projets ou de contenus préfères-tu travailler',
        type: 'textarea',
        required: true
      },
      {
        id: 'tools',
        text: 'Quels outils ou logiciels utilises-tu principalement',
        type: 'textarea',
        required: true
      },
      {
        id: 'portfolio',
        text: 'Peux-tu partager des exemples de projets passés ou décrire des réalisations dont tu es fier ?',
        type: 'textarea',
        required: true
      },
      {
        id: 'expectations',
        text: 'Qu\'attends-tu de cette plateforme et du type de collaborations que tu veux y trouver ?',
        type: 'textarea',
        required: true
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
        id: 'firstName',
        text: 'Nom',
        type: 'text',
        required: true
      },
      {
        id: 'lastName',
        text: 'Prénom',
        type: 'text',
        required: true
      },
      {
        id: 'pseudo',
        text: 'Pseudo (nom de créateur)',
        type: 'text',
        required: true
      },
      {
        id: 'email',
        text: 'Adresse e-mail',
        type: 'text',
        required: true
      },
      {
        id: 'platforms',
        text: 'Lien vers ta/tes plateforme(s) (YouTube, TikTok, etc.)',
        type: 'textarea',
        required: true
      }
    ]
  },
  {
    id: 'content',
    title: 'Questions sur ton contenu',
    questions: [
      {
        id: 'contentType',
        text: 'Décris le type de contenu que tu créer et dans quel domaine',
        type: 'textarea',
        required: true
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userType, setUserType] = useState<'expert' | 'creator' | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const steps = userType === 'expert' ? expertSteps : creatorSteps;
  const totalQuestions = steps.reduce((acc: number, step: Step) => acc + step.questions.length, 0);
  const currentStep = steps[stepIndex];
  const currentQuestion = currentStep.questions[questionIndex];
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
    }
  };

  const handleSubmit = async () => {
    if (!user || !userType) return;
    setLoading(true);
    try {
      const userData = {
        ...answers,
        userType,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
        ...(userType === 'creator' ? {
          platforms: answers.platforms,
          contentType: answers.contentType,
          publishingFrequency: answers.publishingFrequency,
          challenges: answers.challenges,
          previousCollaborations: answers.previousCollaborations,
          neededServices: answers.neededServices,
          goals: answers.goals
        } : {
          expertise: answers.presentation,
          experience: answers.experience,
          preferredProjects: answers.preferredProjects,
          tools: answers.tools,
          portfolio: answers.portfolio,
          expectations: answers.expectations
        })
      };
      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 flex flex-col items-center p-4">
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
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-gray-300">
              {currentQuestion.text}
              {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
            </label>
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
          </div>
        </div>
        <div className="flex justify-between mt-8">
          <Button
            onClick={handleBack}
            disabled={stepIndex === 0 && questionIndex === 0}
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