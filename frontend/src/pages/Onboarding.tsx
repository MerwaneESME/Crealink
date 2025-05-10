import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

const onboardingFields = [
  {
    id: "phone",
    label: "Téléphone",
    type: "tel",
    placeholder: "Votre numéro de téléphone",
    required: true
  },
  {
    id: "address",
    label: "Adresse",
    type: "text",
    placeholder: "Votre adresse",
    required: true
  },
  {
    id: "bio",
    label: "Biographie",
    type: "textarea",
    placeholder: "Parlez-nous de vous",
    required: true
  },
  {
    id: "skills",
    label: "Compétences",
    type: "textarea",
    placeholder: "Listez vos compétences (séparées par des virgules)",
    required: true
  },
  {
    id: "experience",
    label: "Expérience",
    type: "textarea",
    placeholder: "Décrivez votre expérience professionnelle",
    required: true
  },
  {
    id: "education",
    label: "Formation",
    type: "textarea",
    placeholder: "Décrivez votre parcours éducatif",
    required: true
  }
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Record<string, string | string[]>>({
    phone: "",
    address: "",
    bio: "",
    skills: "",
    experience: "",
    education: ""
  });
  const [step, setStep] = useState(0);

  const handleNext = () => {
    setError("");
    if (onboardingFields[step].required && !formData[onboardingFields[step].id]) {
      setError("Ce champ est requis");
      return;
    }
    if (step < onboardingFields.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }
      await authService.updateUserProfile(user.uid, {
        ...formData,
        skills: typeof formData.skills === 'string'
          ? formData.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean)
          : formData.skills
      });
      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const progress = ((step + 1) / onboardingFields.length) * 100;
  const currentField = onboardingFields[step];

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
              Complétez votre profil
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Ajoutez vos informations personnelles pour finaliser votre inscription
            </CardDescription>
          </CardHeader>
          <div className="px-6 pt-2">
            <Progress value={progress} className="h-2 bg-purple-900/30" />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Étape {step + 1} sur {onboardingFields.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          <form onSubmit={step === onboardingFields.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={currentField.id} className="text-gray-300">{currentField.label}</Label>
                {currentField.type === "textarea" ? (
                  <Textarea
                    id={currentField.id}
                    placeholder={currentField.placeholder}
                    value={formData[currentField.id] as string}
                    onChange={(e) => setFormData({ ...formData, [currentField.id]: e.target.value })}
                    className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50 min-h-[100px]"
                    required={currentField.required}
                  />
                ) : (
                  <Input
                    id={currentField.id}
                    type={currentField.type}
                    placeholder={currentField.placeholder}
                    value={formData[currentField.id] as string}
                    onChange={(e) => setFormData({ ...formData, [currentField.id]: e.target.value })}
                    className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50"
                    required={currentField.required}
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              {error && (
                <div className="text-red-500 text-sm text-center w-full">
                  {error}
                </div>
              )}
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 0}
                  variant="outline"
                  className="border-purple-500/20 text-gray-300 hover:bg-purple-900/30"
                >
                  Précédent
                </Button>
                {step === onboardingFields.length - 1 ? (
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Mise à jour..." : "Finaliser mon profil"}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Suivant
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 