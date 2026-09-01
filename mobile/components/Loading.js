import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext'; // Adjust the path as needed

const LoadingComponent = ({ 
  message = "Loading...", 
  size = "large", 
  color, // Remove default - will use theme
  backgroundColor, // Remove default - will use theme
  showText = true,
  style,
  textStyle 
}) => {
  const { theme } = useTheme();
  
  // Use theme colors as defaults if not provided
  const loadingColor = color || theme.primary;
  const bgColor = backgroundColor || theme.background;
  const textColor = textStyle?.color || theme.textSecondary;
  
  return (
    <View style={[styles.loadingContainer, { backgroundColor: bgColor }, style]}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size={size} color={loadingColor} />
        {showText && (
          <Text style={[
            styles.loadingText, 
            { color: textColor },
            textStyle
          ]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    // Move content up to account for header/footer
    marginTop: -105, // Adjust this value based on your header/footer heights
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    textAlign: 'center',
  },
});

export default LoadingComponent;