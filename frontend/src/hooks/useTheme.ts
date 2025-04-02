import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Essayer de récupérer le thème depuis localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    // Vérifier si l'utilisateur a des préférences système pour le thème
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Retourner le thème sauvegardé ou les préférences système
    return savedTheme || (userPrefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    // Enregistrer le thème dans localStorage quand il change
    localStorage.setItem('theme', theme);
    
    // Mettre à jour les classes sur l'élément HTML
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return { theme, setTheme };
} 