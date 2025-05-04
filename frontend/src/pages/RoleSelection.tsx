import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

export default function RoleSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    role: "creator",
    experience: "",
    interests: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      await authService.updateUserProfile(user.uid, {
        role: formData.role,
        experience: formData.experience,
        interests: formData.interests
      });

      navigate("/onboarding");
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

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
              Choisissez votre rôle
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Dites-nous qui vous êtes et ce que vous recherchez
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-gray-300">Je suis...</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creator" id="creator" />
                    <Label htmlFor="creator" className="text-gray-300">Créateur</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expert" id="expert" />
                    <Label htmlFor="expert" className="text-gray-300">Expert</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-gray-300">
                  {formData.role === "creator" ? "Quel type de projet souhaitez-vous réaliser ?" : "Quelle est votre expertise ?"}
                </Label>
                <Textarea
                  id="experience"
                  placeholder={formData.role === "creator" ? "Décrivez votre projet..." : "Décrivez votre expertise..."}
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50 min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests" className="text-gray-300">
                  {formData.role === "creator" ? "Quels types d'experts recherchez-vous ?" : "Quels types de projets vous intéressent ?"}
                </Label>
                <Textarea
                  id="interests"
                  placeholder="Décrivez vos intérêts..."
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50 min-h-[100px]"
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-4">
              {error && (
                <div className="text-red-500 text-sm text-center w-full">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                disabled={loading}
              >
                {loading ? "Enregistrement..." : "Continuer"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 