import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../config";

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load cached email when component mounts
  useEffect(() => {
    loadCachedEmail();
  }, []);

  const loadCachedEmail = async () => {
    try {
      const cachedEmail = await AsyncStorage.getItem('lastEmail');
      if (cachedEmail) {
        setEmail(cachedEmail);
      }
    } catch (error) {
      console.error('Error loading cached email:', error);
    }
  };

  const cacheEmail = async (emailToCache) => {
    try {
      await AsyncStorage.setItem('lastEmail', emailToCache);
    } catch (error) {
      console.error('Error caching email:', error);
    }
  };

  const storeTokenData = async (responseData) => {
    try {
      const tokenData = {
        token: responseData.token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
        refreshToken: responseData.refreshToken || null,
        lastVerified: Date.now(),
        tokenType: 'Bearer'
      };

      // Store enhanced token data
      await AsyncStorage.setItem('alumniToken', responseData.token);
      await AsyncStorage.setItem('tokenMetadata', JSON.stringify(tokenData));
      
      // Store user data
      await AsyncStorage.setItem('userData', JSON.stringify({
        _id: responseData._id,
        fullName: responseData.fullName,
        email: responseData.email,
        lastLoginTime: Date.now()
      }));

    } catch (error) {
      console.error('Error storing token data:', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/alumni/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });
      
      const data = await response.json();

      if (response.ok) {
        // Cache the email for future logins
        await cacheEmail(email.toLowerCase().trim());
        
        // Store enhanced token data
        await storeTokenData(data);

        // Navigate to Home screen
        navigation.navigate('Home');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Image source={require('../assets/kitlogo.png')} style={styles.logo} />

      <Text style={styles.title}>Welcome to AIML & DS Alumni Portal</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#64748B"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
          placeholderTextColor="#64748B"
          editable={!loading}
          importantForAutofill="no"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#2E5BFF"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.authButtonsRow}>
        <TouchableOpacity style={styles.authButton}>
          <Image
            source={require('../assets/google.png')}
            style={styles.authLogo}
          />
          <Text style={styles.authText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.authButton}>
          <Image
            source={require('../assets/apple.png')}
            style={styles.authLogo}
          />
          <Text style={styles.authText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 32,
    justifyContent: 'center'
  },
  logo: {
    width: 220,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 32,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    alignItems: 'center',
    paddingLeft: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    padding: 18,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#2E5BFF',
    fontWeight: '600',
    fontSize: 15,
  },
  loginButton: {
    backgroundColor: '#2E5BFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2E5BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    marginHorizontal: 16,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 15,
  },
  authButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  authLogo: {
    width: 22,
    height: 22,
    marginRight: 10,
    resizeMode: 'contain',
  },
  authText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
});
