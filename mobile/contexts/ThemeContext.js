import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light'); // only 'light' or 'dark'
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem('themeMode');
        if (stored && (stored === 'light' || stored === 'dark')) {
          setThemeMode(stored);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  // Save theme preference
  useEffect(() => {
    AsyncStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Update current theme based on mode
  useEffect(() => {
    setCurrentTheme(themeMode === 'dark' ? darkTheme : lightTheme);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{
      theme: currentTheme,
      themeMode,
      setThemeMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);