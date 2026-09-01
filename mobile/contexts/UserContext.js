// contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (userInfo) => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(userInfo));
      setCurrentUser(userInfo);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const logoutUser = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setCurrentUser(null);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      loginUser,
      logoutUser,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
