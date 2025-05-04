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

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    bio: "",
    skills: "",
    experience: "",
    education: ""
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
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
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

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Votre numéro de téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-300">Adresse</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Votre adresse"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">Biographie</Label>
                <Textarea
                  id="bio"
                  placeholder="Parlez-nous de vous"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50 min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-gray-300">Compétences</Label>
                <Textarea
                  id="skills"
                  placeholder="Listez vos compétences (séparées par des virgules)"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50 min-h-[80px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-gray-300">Expérience</Label>
                <Textarea
                  id="experience"
                  placeholder="Décrivez votre expérience professionnelle"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50 min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education" className="text-gray-300">Formation</Label>
                <Textarea
                  id="education"
                  placeholder="Décrivez votre parcours éducatif"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
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
                {loading ? "Mise à jour..." : "Finaliser mon profil"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 