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
import { Badge } from "@/components/ui/badge";
import { Search, X, Upload, Camera } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { toast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Option {
  value: string;
  label: string;
}

interface DependsOn {
  field: string;
  options: Record<string, Option[]>;
}

interface BaseQuestion {
  id: string;
  text: string;
  required: boolean;
  placeholder?: string;
}

interface SelectQuestion extends BaseQuestion {
  type: 'select';
  options: Option[];
  dependsOn?: DependsOn;
}

interface TagsQuestion extends BaseQuestion {
  type: 'tags';
  options: string[];
}

interface TextAreaQuestion extends BaseQuestion {
  type: 'textarea';
}

interface SocialLinksQuestion extends BaseQuestion {
  type: 'socialLinks';
  fields: Array<{
    id: string;
    label: string;
    placeholder: string;
  }>;
}

interface ProfileCustomizationQuestion extends BaseQuestion {
  type: 'profileCustomization';
}

interface RadioQuestion extends BaseQuestion {
  type: 'radio';
  options: string[];
}

type Question = SelectQuestion | TagsQuestion | TextAreaQuestion | SocialLinksQuestion | ProfileCustomizationQuestion | RadioQuestion;

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
        id: 'expertiseType',
        text: 'Quelle est ta spécialité principale ?',
        type: 'select',
        required: true,
        options: [
          { value: 'editor', label: 'Monteur' },
          { value: 'designer', label: 'Designer' },
          { value: 'thumbnailMaker', label: 'Miniaturiste' },
          { value: 'soundDesigner', label: 'Sound Designer' },
          { value: 'motionDesigner', label: 'Motion Designer' },
          { value: 'videoEditor', label: 'Réalisateur' },
          { value: 'photographer', label: 'Photographe' },
          { value: 'colorist', label: 'Coloriste' }
        ]
      },
      {
        id: 'expertiseSubType',
        text: 'Quelle est ta sous-spécialité ?',
        type: 'select',
        required: true,
        options: [],
        dependsOn: {
          field: 'expertiseType',
          options: {
            editor: [
              { value: 'shorts', label: 'Monteur Shorts/TikTok' },
              { value: 'youtube', label: 'Monteur YouTube' },
              { value: 'documentary', label: 'Monteur Documentaire' },
              { value: 'gaming', label: 'Monteur Gaming' },
              { value: 'corporate', label: 'Monteur Corporate' }
            ],
            designer: [
              { value: 'logo', label: 'Logo Designer' },
              { value: 'branding', label: 'Branding Designer' },
              { value: 'ui', label: 'UI Designer' },
              { value: 'illustration', label: 'Illustrateur' }
            ],
            thumbnailMaker: [
              { value: 'youtube', label: 'Miniatures YouTube' },
              { value: 'gaming', label: 'Miniatures Gaming' },
              { value: 'lifestyle', label: 'Miniatures Lifestyle' }
            ],
            soundDesigner: [
              { value: 'music', label: 'Compositeur' },
              { value: 'mixing', label: 'Mixage Audio' },
              { value: 'voiceover', label: 'Voice Over' }
            ],
            motionDesigner: [
              { value: '2d', label: 'Motion Design 2D' },
              { value: '3d', label: 'Motion Design 3D' },
              { value: 'vfx', label: 'VFX' }
            ],
            videoEditor: [
              { value: 'commercial', label: 'Publicités' },
              { value: 'music', label: 'Clips Musicaux' },
              { value: 'corporate', label: 'Vidéos Corporate' }
            ],
            photographer: [
              { value: 'portrait', label: 'Portrait' },
              { value: 'event', label: 'Événementiel' },
              { value: 'product', label: 'Produit' }
            ],
            colorist: [
              { value: 'film', label: 'Film' },
              { value: 'commercial', label: 'Publicité' },
              { value: 'tv', label: 'Télévision' }
            ]
          }
        }
      },
      {
        id: 'skills',
        text: 'Quels sont tes outils et compétences ?',
        type: 'tags',
        required: true,
        options: [
          // Montage Vidéo
          'Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'Vegas Pro', 'After Effects',
          'Montage Gaming', 'Montage Vlog', 'Montage Shorts', 'Color Grading', 'Sound Design',
          // Design
          'Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Sketch', 'XD',
          'UI Design', 'Web Design', 'Logo Design', 'Branding', 'Illustration',
          // 3D et Motion
          'Cinema 4D', 'Blender', '3DS Max', 'Maya', 'Unity', 'Unreal Engine',
          'Motion Design', 'VFX', 'Animation 2D', 'Animation 3D', 'Rigging',
          // Audio
          'Pro Tools', 'Ableton Live', 'FL Studio', 'Logic Pro', 'Audition',
          'Mixage', 'Mastering', 'Sound Design', 'Voice Over', 'Composition',
          // Photo
          'Lightroom', 'Capture One', 'Studio Photo', 'Retouche', 'Portrait',
          'Événementiel', 'Product Photo', 'Lifestyle', 'Architecture'
        ]
      },
      {
        id: 'expertise',
        text: 'Quel est ton niveau d\'expertise ?',
        type: 'radio',
        required: true,
        options: [
          'Débutant (0-2 ans)',
          'Intermédiaire (2-5 ans)',
          'Confirmé (5-8 ans)',
          'Expert (8+ ans)'
        ]
      },
      {
        id: 'services',
        text: 'Quels services proposes-tu ?',
        type: 'tags',
        required: true,
        options: [
          // Services généraux
          'Projets complets', 'Consulting', 'Formation', 'Mentorat',
          // Services spécifiques par domaine
          'Montage vidéo', 'Création de miniatures', 'Motion design',
          'Design graphique', 'Mixage audio', 'Sound design',
          'Photographie', 'Retouche photo', 'Direction artistique',
          // Types de projets
          'Projets YouTube', 'Projets TikTok', 'Projets Instagram',
          'Projets Corporate', 'Publicités', 'Clips musicaux',
          // Modalités
          'Travail à distance', 'Travail sur site', 'Disponible 24/7',
          'Projets urgents', 'Projets long terme', 'Collaboration régulière'
        ]
      }
    ]
  },
  {
    id: 'profileCustomization',
    title: 'Personnalisation du profil',
    questions: [
      {
        id: 'profileCustomization',
        text: 'Personnalisez votre profil',
        type: 'profileCustomization',
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
        id: 'socialLinks',
        text: 'Liens de vos réseaux sociaux',
        type: 'socialLinks',
        required: true,
        fields: [
          { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@votre-chaine' },
          { id: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/votre-chaine' },
          { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/votre-compte' },
          { id: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@votre-compte' }
        ]
      }
    ]
  },
  {
    id: 'content',
    title: 'Questions sur ton contenu',
    questions: [
      {
        id: 'contentTypes',
        text: 'Quel type de contenu créez-vous ?',
        type: 'tags',
        required: true,
        options: [
          // Gaming
          'Gaming', 'Minecraft', 'Fortnite', 'Call of Duty', 'League of Legends', 'GTA', 'Speedrun', 'Let\'s Play', 'Gaming Reaction',
          // Divertissement
          'Vlog', 'Humour', 'Sketch', 'Réaction', 'Podcast', 'Talk-show', 'Interview',
          // Lifestyle
          'Lifestyle', 'Mode', 'Beauté', 'Voyage', 'Food', 'Cuisine', 'Restaurant', 'Fitness', 'Sport', 'Bien-être',
          // Culture
          'Culture', 'Cinéma', 'Série', 'Anime', 'Manga', 'Livre', 'Histoire', 'Science', 'Politique', 'Actualité',
          // Art et Musique
          'Musique', 'Clip', 'Cover', 'Danse', 'Art', 'Dessin', 'Peinture', 'DIY', 'Artisanat',
          // Tech
          'Tech', 'High-Tech', 'Informatique', 'Smartphone', 'PC', 'Console', 'Tutoriel', 'Review',
          // Business
          'Business', 'Entrepreneuriat', 'Finance', 'Crypto', 'Trading', 'Marketing', 'Formation',
          // Format
          'Short', 'Live', 'VOD', 'Stories', 'Reel'
        ]
      },
      {
        id: 'platforms',
        text: 'Sur quelles plateformes publiez-vous ?',
        type: 'tags',
        required: true,
        options: [
          'YouTube', 'Twitch', 'TikTok', 'Instagram', 'Instagram Reels', 'YouTube Shorts',
          'Twitter', 'Facebook', 'LinkedIn', 'Snapchat', 'Discord', 'Blog', 'Podcast'
        ]
      },
      {
        id: 'targetAudience',
        text: 'Quelle est votre audience cible ?',
        type: 'tags',
        required: true,
        options: [
          'Enfants', 'Adolescents', 'Jeunes adultes', 'Adultes', 'Famille',
          'Gamers', 'Geeks', 'Professionnels', 'Étudiants', 'Passionnés de tech',
          'Fans de mode', 'Sportifs', 'Créatifs', 'Entrepreneurs'
        ]
      },
      {
        id: 'expertiseNeeded',
        text: 'Quels types d\'experts recherchez-vous ?',
        type: 'tags',
        required: true,
        options: [
          'Monteur vidéo', 'Monteur gaming', 'Monteur shorts/TikTok',
          'Graphiste', 'Motion designer', 'Miniaturiste',
          'Sound designer', 'Compositeur', 'Voice over',
          'Photographe', 'Coloriste', 'Réalisateur',
          'Community manager', 'Scénariste', 'Coach contenu'
        ]
      }
    ]
  },
  {
    id: 'profileCustomization',
    title: 'Personnalisation du profil',
    questions: [
      {
        id: 'profileCustomization',
        text: 'Personnalisez votre profil',
        type: 'profileCustomization',
        required: true
      }
    ]
  }
];

const TagSelector = ({ 
  question, 
  selectedTags, 
  onTagsChange 
}: { 
  question: TagsQuestion, 
  selectedTags: string[], 
  onTagsChange: (tags: string[]) => void 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredOptions = question.options.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Label>{question.text}</Label>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-black/50 border-purple-500/20 text-white"
        />
      </div>

      <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
        {filteredOptions.map((tag) => (
          <Button
            key={tag}
            type="button"
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            onClick={() => {
              const newTags = selectedTags.includes(tag)
                ? selectedTags.filter(t => t !== tag)
                : [...selectedTags, tag];
              onTagsChange(newTags);
            }}
            className={`text-sm transition-all duration-200 ${
              selectedTags.includes(tag)
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-black/40 border-purple-500/20 hover:bg-purple-900/20 hover:border-purple-500/40'
            }`}
          >
            {tag}
          </Button>
        ))}
      </div>

      {selectedTags.length > 0 && (
        <div className="mt-4">
          <Label className="text-sm text-gray-400">Tags sélectionnés :</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                onClick={() => {
                  onTagsChange(selectedTags.filter(t => t !== tag));
                }}
              >
                {tag}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileCustomization = ({ 
  onCustomizationChange 
}: { 
  onCustomizationChange: (data: { displayName: string, photoFile: File | null }) => void 
}) => {
  const [displayName, setDisplayName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onCustomizationChange({ displayName, photoFile: file });
    }
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
    onCustomizationChange({ displayName: e.target.value, photoFile });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div 
          className="w-32 h-32 rounded-full relative overflow-hidden group cursor-pointer border-2 border-purple-500/20"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoPreview ? (
            <img 
              src={photoPreview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-purple-900/30 flex items-center justify-center">
              <Camera className="w-8 h-8 text-purple-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="w-6 h-6 text-white" />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        <p className="text-sm text-gray-400">
          Cliquez pour ajouter une photo de profil
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Pseudonyme</Label>
        <Input
          id="displayName"
          placeholder="Votre nom d'affichage"
          value={displayName}
          onChange={handleDisplayNameChange}
          className="bg-black/50 border-purple-500/20 text-white"
        />
        <p className="text-sm text-gray-400">
          Ce nom sera affiché sur votre profil et visible par les autres utilisateurs
        </p>
      </div>
    </div>
  );
};

const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(147, 51, 234, 0.5);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(147, 51, 234, 0.7);
  }
`;

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
      // Si on n'est pas à la première question de l'étape actuelle,
      // on revient à la question précédente
      setQuestionIndex(questionIndex - 1);
    } else if (stepIndex > 0) {
      // Si on est à la première question d'une étape (mais pas la première étape),
      // on revient à la dernière question de l'étape précédente
      const previousStep = steps[stepIndex - 1];
      setStepIndex(stepIndex - 1);
      setQuestionIndex(previousStep.questions.length - 1);
    } else {
      // Si on est à la première question de la première étape,
      // là on revient à la sélection du rôle
      navigate('/role-selection');
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let photoUrl = '';
      
      // Upload de la photo si elle existe
      if (answers.photoFile) {
        try {
          const storageRef = ref(storage, `avatars/${user.uid}`);
          const uploadResult = await uploadBytes(storageRef, answers.photoFile);
          photoUrl = await getDownloadURL(uploadResult.ref);
        } catch (error) {
          console.error('Erreur lors de l\'upload de l\'image:', error);
          throw new Error('Erreur lors de l\'upload de l\'image');
        }
      }

      // Préparer les données à sauvegarder (sans le fichier)
      const { photoFile, ...dataToSave } = answers;
      
      const userData: Record<string, any> = {
        ...dataToSave,
        photoURL: photoUrl || user.photoURL || '',
        displayName: answers.displayName || user.displayName || '',
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      };

      if (userType === 'expert') {
        userData.expertise = {
          mainType: answers.expertiseType,
          subType: answers.expertiseSubType,
          description: answers.skills.join(', '),
          level: answers.expertise
        };
        userData.description = answers.skills.join(', ');
        userData.bio = answers.skills.join(', ');
        userData.skills = answers.skills || [];
        userData.services = answers.services || [];
      } else if (userType === 'creator') {
        userData.socials = {
          youtube: answers.youtube || '',
          twitch: answers.twitch || '',
          instagram: answers.instagram || '',
          tiktok: answers.tiktok || ''
        };
        userData.youtube = answers.youtube || '';
        userData.twitch = answers.twitch || '';
        userData.instagram = answers.instagram || '';
        userData.tiktok = answers.tiktok || '';
        
        userData.skills = answers.contentTypes || [];
        userData.contentTypes = answers.contentTypes || [];
        userData.platforms = answers.platforms || [];
        userData.targetAudience = answers.targetAudience || [];
        userData.expertiseNeeded = answers.expertiseNeeded || [];
      }

      // Sauvegarder dans Firestore
      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      
      // Rafraîchir les données utilisateur
      await refreshUser();
      
      // Redirection vers le dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde de votre profil. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectOptions = (question: SelectQuestion, answers: Record<string, any>): Option[] => {
    if (question.dependsOn) {
      const parentValue = answers[question.dependsOn.field];
      if (parentValue && question.dependsOn.options[parentValue]) {
        return question.dependsOn.options[parentValue];
      }
      return [];
    }
    return question.options;
  };

  const renderQuestion = (question: Question, answers: Record<string, any>, handleAnswer: (id: string, value: any) => void) => {
    switch (question.type) {
      case 'select':
        const options = getSelectOptions(question, answers);
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <select
              id={question.id}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="w-full p-2 bg-black/50 border border-purple-500/20 rounded-md text-gray-300 focus:ring-purple-500/50"
              required={question.required}
            >
              <option value="">Sélectionnez une option</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <textarea
              id={question.id}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full h-32 p-2 bg-black/50 border border-purple-500/20 rounded-md text-gray-300 focus:ring-purple-500/50"
              required={question.required}
            />
          </div>
        );
      case 'socialLinks':
        return (
          <div className="space-y-4">
            <Label>{question.text}</Label>
            {question.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  type="url"
                  placeholder={field.placeholder}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleAnswer(field.id, e.target.value)}
                  className="bg-black/50 border-purple-500/20 text-gray-300 focus:ring-purple-500/50"
                />
              </div>
            ))}
          </div>
        );
      case 'tags':
        return (
          <TagSelector
            question={question}
            selectedTags={answers[question.id] || []}
            onTagsChange={(tags) => handleAnswer(question.id, tags)}
          />
        );
      case 'profileCustomization':
        return (
          <ProfileCustomization
            onCustomizationChange={(data) => {
              handleAnswer('displayName', data.displayName);
              handleAnswer('photoFile', data.photoFile);
            }}
          />
        );
      case 'radio':
        return (
          <div className="space-y-4">
            <Label>{question.text}</Label>
            <div className="flex flex-col space-y-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(question.id, option)}
                  className={`flex items-center p-4 rounded-lg border transition-all text-left w-full ${
                    answers[question.id] === option
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-black/40 border-purple-500/20 hover:bg-purple-900/20 text-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[question.id] === option
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-purple-500/50'
                  }`}>
                    {answers[question.id] === option && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
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
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 flex items-center justify-center p-4 pt-24">
      <style>{styles}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg shadow-purple-500/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              {currentStep?.title}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Question {currentQuestionNumber} sur {totalQuestions}
            </CardDescription>
          </CardHeader>

          <div className="px-6 pt-2">
            <Progress value={progress} className="h-2 bg-purple-900/30" />
          </div>

          <CardContent className="space-y-4 mt-4">
            {currentQuestion && renderQuestion(currentQuestion, answers, handleAnswer)}
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="bg-black/40 border-purple-500/20 hover:bg-purple-900/20"
              >
                Précédent
              </Button>
              {stepIndex < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                  Suivant
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                  {loading ? "Enregistrement..." : "Terminer"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OnboardingForm; 