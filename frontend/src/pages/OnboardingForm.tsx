import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

// Types pour les questions
interface Question {
  id: string;
  text: string;
  type: 'radio' | 'text' | 'textarea';
  options?: string[];
  placeholder?: string;
  required: boolean;
  dependsOn?: {
    questionId: string;
    value: string;
  };
}

export default function OnboardingForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  // Questions pour les créateurs
  const creatorQuestions: Question[] = [
    {
      id: "role",
      text: "Êtes-vous un créateur ou un expert ?",
      type: "radio",
      options: ["creator", "expert"],
      required: true
    },
    {
      id: "projectType",
      text: "Quel type de projet souhaitez-vous réaliser ?",
      type: "textarea",
      placeholder: "Décrivez votre projet...",
      required: true,
      dependsOn: {
        questionId: "role",
        value: "creator"
      }
    },
    {
      id: "expertise",
      text: "Quelle est votre expertise ?",
      type: "textarea",
      placeholder: "Décrivez votre expertise...",
      required: true,
      dependsOn: {
        questionId: "role",
        value: "expert"
      }
    },
    {
      id: "interests",
      text: "Quels types d'experts recherchez-vous ?",
      type: "textarea",
      placeholder: "Décrivez les types d'experts...",
      required: true,
      dependsOn: {
        questionId: "role",
        value: "creator"
      }
    },
    {
      id: "projectInterests",
      text: "Quels types de projets vous intéressent ?",
      type: "textarea",
      placeholder: "Décrivez les types de projets...",
      required: true,
      dependsOn: {
        questionId: "role",
        value: "expert"
      }
    },
    {
      id: "phone",
      text: "Quel est votre numéro de téléphone ?",
      type: "text",
      placeholder: "Votre numéro de téléphone",
      required: true
    },
    {
      id: "address",
      text: "Quelle est votre adresse ?",
      type: "text",
      placeholder: "Votre adresse",
      required: true
    },
    {
      id: "bio",
      text: "Parlez-nous de vous",
      type: "textarea",
      placeholder: "Votre biographie...",
      required: true
    },
    {
      id: "skills",
      text: "Quelles sont vos compétences ?",
      type: "textarea",
      placeholder: "Listez vos compétences (séparées par des virgules)",
      required: true
    },
    {
      id: "experience",
      text: "Quelle est votre expérience professionnelle ?",
      type: "textarea",
      placeholder: "Décrivez votre expérience...",
      required: true
    },
    {
      id: "education",
      text: "Quelle est votre formation ?",
      type: "textarea",
      placeholder: "Décrivez votre parcours éducatif...",
      required: true
    }
  ];

  // Filtrer les questions en fonction des réponses précédentes
  const getVisibleQuestions = () => {
    return creatorQuestions.filter(question => {
      if (!question.dependsOn) return true;
      
      const dependentValue = formData[question.dependsOn.questionId];
      return dependentValue === question.dependsOn.value;
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const totalSteps = visibleQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Préparer les données pour la mise à jour
      const userData: Record<string, any> = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean) : []
      };

      await authService.updateUserProfile(user.uid, userData);
      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    const currentQuestion = visibleQuestions[currentStep];
    setFormData({
      ...formData,
      [currentQuestion.id]: value
    });
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const currentQuestion = visibleQuestions[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 flex items-center justify-center p-4 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg shadow-purple-500/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Complétez votre profil
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Question {currentStep + 1} sur {totalSteps}
            </CardDescription>
          </CardHeader>

          {/* Barre de progression */}
          <div className="px-6 py-2">
            <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                style={{
                  boxShadow: "0 0 10px rgba(168, 85, 247, 0.7), 0 0 20px rgba(168, 85, 247, 0.5), 0 0 30px rgba(168, 85, 247, 0.3)"
                }}
              />
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <Label className="text-xl text-gray-300">{currentQuestion.text}</Label>
                
                {currentQuestion.type === 'radio' && currentQuestion.options && (
                  <RadioGroup
                    value={formData[currentQuestion.id] || ""}
                    onValueChange={handleInputChange}
                    className="grid grid-cols-2 gap-4"
                  >
                    {currentQuestion.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="text-gray-300">
                          {option === "creator" ? "Créateur" : "Expert"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === 'text' && (
                  <Input
                    id={currentQuestion.id}
                    type="text"
                    placeholder={currentQuestion.placeholder}
                    value={formData[currentQuestion.id] || ""}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50"
                    required={currentQuestion.required}
                  />
                )}

                {currentQuestion.type === 'textarea' && (
                  <Textarea
                    id={currentQuestion.id}
                    placeholder={currentQuestion.placeholder}
                    value={formData[currentQuestion.id] || ""}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50 min-h-[100px]"
                    required={currentQuestion.required}
                  />
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between space-x-4 pt-4">
              {error && (
                <div className="text-red-500 text-sm text-center w-full mb-4">
                  {error}
                </div>
              )}
              
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="border-purple-500/20 text-gray-300 hover:bg-purple-500/10"
                  onClick={handleBack}
                  disabled={currentStep === 0 || loading}
                >
                  Précédent
                </Button>
                
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  disabled={loading || !formData[currentQuestion.id]}
                >
                  {loading ? "Enregistrement..." : isLastStep ? "Terminer" : "Suivant"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 