import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons'; // or whatever icon library you're using

export default function CustomHeader() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  return (
    <View style={[
      styles.header, 
      { 
        paddingTop: insets.top,
        backgroundColor: theme.card,
        borderBottomColor: theme.border,
        shadowColor: theme.shadowColor,
      }
    ]}>
      <View style={styles.titleContainer}>
        <MaterialIcons 
          name="school" 
          size={34} 
          color={theme.primary} 
          style={styles.icon}
        />
        <Text style={[styles.titleText, { color: theme.primary }]}>
          Back2Campus
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 5,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});