import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : { mode: 'light', accentColor: 'purple' };
  });

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
    
    // Apply theme to document
    if (theme.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply accent color as CSS variable
    const colors = {
      purple: { primary: '#9333ea', secondary: '#a855f7' },
      blue: { primary: '#2563eb', secondary: '#3b82f6' },
      green: { primary: '#16a34a', secondary: '#22c55e' },
      orange: { primary: '#ea580c', secondary: '#f97316' },
      red: { primary: '#dc2626', secondary: '#ef4444' }
    };
    
    const color = colors[theme.accentColor] || colors.purple;
    document.documentElement.style.setProperty('--color-primary', color.primary);
    document.documentElement.style.setProperty('--color-secondary', color.secondary);
  }, [theme]);

  const updateTheme = (updates) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
