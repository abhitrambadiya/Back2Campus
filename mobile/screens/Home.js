// MainScreen.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../components/CustomHeader';
import BottomNav from '../components/BottomNav';
import HomeSection from '../components/Dashboard';
import ProfileSection from '../components/Profile';
import AlumniMeetSection from '../components/AlumniMeet';
import { useNavigation } from '@react-navigation/native';

const MainScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeScreen, setActiveScreen] = useState('Home');

  const handleNavigation = (route) => {
    setActiveScreen(route);
  };

  const renderMiddleSection = () => {
    switch (activeScreen) {
      case 'Home':
        return <HomeSection onNavigate={handleNavigation} />;
      case 'Profile':
        return <ProfileSection />;
      case 'AlumniMeet':
        return <AlumniMeetSection />;
      default:
        return <HomeSection onNavigate={handleNavigation} />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeScreen) {
      case 'Home':
        return 'Home';
      case 'Profile':
        return 'Profile';
      case 'AlumniMeet':
        return 'Alumni Meet';
      default:
        return 'Home';
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header - Loads only once */}
      <CustomHeader 
        navigation={navigation} 
        title={getHeaderTitle()} 
      />

      {/* Dynamic Middle Section */}
      <View style={styles.middleSection}>
        {renderMiddleSection()}
      </View>

      {/* Fixed Footer - Loads only once */}
      <BottomNav 
        navigation={navigation} 
        activeScreen={activeScreen}
        onNavigate={handleNavigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  middleSection: {
    flex: 1,
  },
});

export default MainScreen;
