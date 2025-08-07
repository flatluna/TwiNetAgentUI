import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'dark-blue' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark' | 'dark-blue';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get theme from localStorage, default to 'light'
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'light';
    }
    return 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'dark-blue'>('light');

  // Calculate resolved theme based on theme setting
  useEffect(() => {
    const calculateResolvedTheme = () => {
      if (theme === 'auto') {
        // Use system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemPrefersDark ? 'dark' : 'light';
      }
      return theme === 'dark-blue' ? 'dark-blue' : theme;
    };

    const newResolvedTheme = calculateResolvedTheme();
    setResolvedTheme(newResolvedTheme);

    // Apply theme to document
    const root = document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark', 'dark-blue');
    
    // Add current theme class
    root.classList.add(newResolvedTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);

    // Listen for system theme changes when auto is selected
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        root.classList.remove('light', 'dark', 'dark-blue');
        root.classList.add(newTheme);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
