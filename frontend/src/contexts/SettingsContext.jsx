import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const SettingsContext = createContext();

const defaultSettings = {
  learning: {
    difficultyLevel: 'intermediate',
    aiModel: 'gemini-2.5-flash',
    defaultStudyMode: 'flashcards',
    autoSave: true
  },
  notifications: {
    email: true,
    studyReminders: true,
    reminderTime: '09:00',
    streakAlerts: true,
    frequency: 'daily'
  }
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().settings) {
            setSettings(userDoc.data().settings);
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save settings to Firestore
  const updateSettings = async (updates) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { settings: newSettings }, { merge: true });
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
