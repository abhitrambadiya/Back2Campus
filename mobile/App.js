import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';


import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/Home';

import InternshipScreen from './screens/InternshipScreen';
import MentorshipScreen from './screens/MentorshipScreen';
import FAQScreen from './screens/FAQ';
import DonationScreen from './screens/DonationScreen';
const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <NavigationContainer>
        <ThemeProvider>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

          <Stack.Screen name="Internship" component={InternshipScreen} />
          <Stack.Screen name="Mentorship" component={MentorshipScreen} />
          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="DonationScreen" component={DonationScreen} />
        </Stack.Navigator>
        </ThemeProvider>
      </NavigationContainer>
    </>
  );
}
