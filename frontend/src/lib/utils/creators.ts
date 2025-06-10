export const creatorTypes = {
  gaming: "Gaming",
  lifestyle: "Lifestyle",
  education: "Éducation",
  entertainment: "Divertissement",
  tech: "Tech",
  beauty: "Beauté & Mode",
  food: "Cuisine",
  fitness: "Sport & Fitness",
  business: "Business",
  art: "Art & Créativité",
  travel: "Voyage",
  music: "Musique"
};

export const creatorSubTypes = {
  gaming: {
    gameplay: "Gameplay",
    esport: "Esport",
    gaming_news: "Actualités Gaming",
    speedrun: "Speedrun",
    retrogaming: "Retrogaming",
    gaming_tips: "Guides & Astuces",
    gaming_entertainment: "Gaming Entertainment",
    gaming_reviews: "Tests & Reviews"
  },
  lifestyle: {
    daily_vlog: "Vlog Quotidien",
    fashion: "Mode",
    luxury: "Luxe",
    minimalism: "Minimalisme",
    sustainable: "Mode de vie durable",
    family: "Famille",
    home_decor: "Décoration",
    self_improvement: "Développement personnel"
  },
  education: {
    tutorials: "Tutoriels",
    science: "Sciences",
    history: "Histoire",
    languages: "Langues",
    programming: "Programmation",
    academic: "Scolaire",
    professional: "Formation professionnelle",
    personal_dev: "Développement personnel"
  },
  entertainment: {
    comedy: "Humour",
    sketches: "Sketches",
    reactions: "Réactions",
    challenges: "Défis",
    pranks: "Caméras cachées",
    talk_show: "Talk-show",
    web_series: "Séries Web",
    storytelling: "Storytelling"
  },
  tech: {
    tech_reviews: "Tests Tech",
    tech_news: "Actualités Tech",
    tutorials_tech: "Tutoriels Tech",
    programming: "Programmation",
    gadgets: "Gadgets",
    mobile: "Mobile",
    gaming_hardware: "Hardware Gaming",
    smart_home: "Maison connectée"
  },
  beauty: {
    makeup: "Maquillage",
    skincare: "Soins de la peau",
    fashion_style: "Style vestimentaire",
    hair: "Coiffure",
    luxury_fashion: "Mode de luxe",
    sustainable_fashion: "Mode durable",
    mens_fashion: "Mode masculine",
    beauty_tips: "Conseils beauté"
  },
  food: {
    cooking: "Cuisine",
    baking: "Pâtisserie",
    healthy: "Cuisine healthy",
    restaurant: "Restaurants & Tests",
    international: "Cuisine du monde",
    drinks: "Boissons & Cocktails",
    vegan: "Cuisine végétale",
    food_science: "Science culinaire"
  },
  fitness: {
    workout: "Entraînement",
    yoga: "Yoga",
    nutrition: "Nutrition",
    crossfit: "CrossFit",
    bodybuilding: "Musculation",
    cardio: "Cardio",
    sports_specific: "Sports spécifiques",
    wellness: "Bien-être"
  },
  business: {
    entrepreneurship: "Entrepreneuriat",
    marketing: "Marketing",
    finance: "Finance",
    crypto: "Crypto & Web3",
    career: "Carrière",
    startup: "Startup",
    investing: "Investissement",
    ecommerce: "E-commerce"
  },
  art: {
    digital_art: "Art digital",
    traditional_art: "Art traditionnel",
    animation: "Animation",
    crafts: "DIY & Artisanat",
    music_creation: "Création musicale",
    photography: "Photographie",
    design: "Design",
    art_tips: "Conseils artistiques"
  },
  travel: {
    vlog_travel: "Vlog voyage",
    adventure: "Aventure",
    luxury_travel: "Voyage de luxe",
    budget_travel: "Voyage économique",
    food_travel: "Tourisme culinaire",
    cultural: "Découverte culturelle",
    digital_nomad: "Digital Nomad",
    travel_tips: "Conseils voyage"
  },
  music: {
    covers: "Reprises",
    original: "Musique originale",
    music_production: "Production musicale",
    instrument: "Apprentissage instrument",
    music_review: "Critique musicale",
    music_news: "Actualités musicales",
    dj: "DJ & Mix",
    music_theory: "Théorie musicale"
  }
};

export const audienceRanges = {
  micro: "1K-10K abonnés",
  small: "10K-50K abonnés",
  mid: "50K-100K abonnés",
  large: "100K-500K abonnés",
  xl: "500K-1M abonnés",
  xxl: "+1M abonnés"
};

export const getCreatorTypeName = (creatorType: string): string => {
  return creatorTypes[creatorType as keyof typeof creatorTypes] || creatorType;
};

export const getCreatorSubTypeName = (creatorType: string, subType: string): string => {
  const subTypes = creatorSubTypes[creatorType as keyof typeof creatorSubTypes];
  if (!subTypes) return subType;
  return subTypes[subType as keyof typeof subTypes] || subType;
};

export const getAudienceRangeLabel = (range: string): string => {
  return audienceRanges[range as keyof typeof audienceRanges] || range;
}; 