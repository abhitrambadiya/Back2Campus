import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext'; // Adjust the path as needed

const BottomNav = ({ activeScreen, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  const handlePress = (screenName) => {
    if (onNavigate) {
      onNavigate(screenName);
    }
  };
  
  return (
    <View style={[
      styles.bottomNavigation, 
      { 
        paddingBottom: insets.bottom,
        backgroundColor: theme.card,
        borderTopColor: theme.border,
        shadowColor: theme.shadowColor,
      }
    ]}>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handlePress('Home')}
      >
        <Icon 
          name="home" 
          size={30} 
          color={activeScreen === 'Home' ? theme.primary : theme.textTertiary} 
        />
        <Text style={[
          styles.navText, 
          { color: theme.textTertiary },
          activeScreen === 'Home' && { color: theme.primary }
        ]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handlePress('AlumniMeet')}
      >
        <Icon 
          name="group" 
          size={35} 
          color={activeScreen === 'AlumniMeet' ? theme.primary : theme.textTertiary} 
        />
        <Text style={[
          styles.navText, 
          { color: theme.textTertiary },
          activeScreen === 'AlumniMeet' && { color: theme.primary }
        ]}>
          Alumni Meet
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handlePress('Profile')}
      >
        <Icon 
          name="person" 
          size={30} 
          color={activeScreen === 'Profile' ? theme.primary : theme.textTertiary} 
        />
        <Text style={[
          styles.navText, 
          { color: theme.textTertiary },
          activeScreen === 'Profile' && { color: theme.primary }
        ]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BottomNav;
