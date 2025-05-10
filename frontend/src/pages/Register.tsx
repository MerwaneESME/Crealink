import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

const registerFields = [
  {
    id: "firstName",
    label: "Prénom",
    type: "text",
    placeholder: "Votre prénom",
    required: true
  },
  {
    id: "lastName",
    label: "Nom",
    type: "text",
    placeholder: "Votre nom",
    required: true
  },
  {
    id: "birthDate",
    label: "Date de naissance",
    type: "date",
    placeholder: "",
    required: true
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "votre@email.com",
    required: true
  },
  {
    id: "password",
    label: "Mot de passe",
    type: "password",
    placeholder: "",
    required: true
  },
  {
    id: "confirmPassword",
    label: "Confirmer le mot de passe",
    type: "password",
    placeholder: "",
    required: true
  }
];

export default function Register() {
  const [formData, setFormData] = useState<Record<string, string>>({
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, user } = useAuth();

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleNext = () => {
    setError("");
    if (registerFields[step].required && !formData[registerFields[step].id]) {
      setError("Ce champ est requis");
      return;
    }
    if (registerFields[step].id === "confirmPassword" && formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (step < registerFields.length - 1) {
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
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }
    try {
      await register(formData.email, formData.password, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        name: `${formData.firstName} ${formData.lastName}`,
        role: "pending"
      });
      navigate("/role-selection");
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / registerFields.length) * 100;
  const currentField = registerFields[step];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 flex items-center justify-center p-4 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg shadow-purple-500/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Créer un compte
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Entrez vos informations pour créer votre compte
            </CardDescription>
          </CardHeader>
          <div className="px-6 pt-2">
            <Progress value={progress} className="h-2 bg-purple-900/30" />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Étape {step + 1} sur {registerFields.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          <form onSubmit={step === registerFields.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={currentField.id} className="text-gray-300">{currentField.label}</Label>
                <Input
                  id={currentField.id}
                  type={currentField.type}
                  placeholder={currentField.placeholder}
                  value={formData[currentField.id]}
                  onChange={(e) => setFormData({ ...formData, [currentField.id]: e.target.value })}
                  className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50"
                  required={currentField.required}
                />
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
                {step === registerFields.length - 1 ? (
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Création du compte..." : "Créer mon compte"}
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
              <p className="text-sm text-gray-400 text-center">
                Déjà un compte ?{" "}
                <Link to="/login" className="text-purple-400 hover:text-purple-300">
                  Se connecter
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 