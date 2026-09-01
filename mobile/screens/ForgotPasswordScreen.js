import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../config"; // API Base URL - Update this with your actual backend URL

export default function ForgotPasswordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState('email'); // email → otp → reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSendOTP = async () => {
    if (!email || !isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/alumni/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'OTP sent to your email successfully!');
        setStep('otp');
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/alumni/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTempToken(data.tempToken);
        Alert.alert('Success', 'OTP verified successfully!');
        setStep('reset');
      } else {
        Alert.alert('Error', data.message || 'Invalid or expired OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/alumni/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ 
          newPassword: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success', 
          'Password has been reset successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'reset') setStep('otp');
    else if (step === 'otp') setStep('email');
    else navigation.goBack();
  };

  const handleResendOTP = async () => {
    Alert.alert(
      'Resend OTP',
      'Do you want to resend the OTP?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => {
            setOtp('');
            handleSendOTP();
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity 
        style={[styles.backButton, { top: insets.top + 20 }]} 
        onPress={goBack}
        disabled={loading}
      >
        <Ionicons name="arrow-back" size={24} color="#2E5BFF" />
      </TouchableOpacity>

      <Image source={require('../assets/kitlogo.png')} style={styles.logo} />

      <Text style={styles.title}>Password Recovery</Text>

      {step === 'email' && (
        <>
          <TextInput
            placeholder="Enter your registered email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#64748B"
            editable={!loading}
          />
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {step === 'otp' && (
        <>
          <Text style={styles.subtitle}>OTP sent to: {email}</Text>
          <TextInput
            placeholder="Enter 6-digit OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
            placeholderTextColor="#64748B"
            maxLength={6}
            editable={!loading}
          />
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resendButton} 
            onPress={handleResendOTP}
            disabled={loading}
          >
            <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 'reset' && (
        <>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="New Password (min 6 characters)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
              placeholderTextColor="#64748B"
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={24} 
                color="#2E5BFF" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.passwordInput}
              placeholderTextColor="#64748B"
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 32, 
    backgroundColor: '#F8FAFC' 
  },
  backButton: { 
    position: 'absolute', 
    left: 32, 
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 220,
    height: 100,
    alignSelf: 'center',
    marginTop: 200,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: { 
    fontSize: 26, 
    fontWeight: '700', 
    color: '#1E293B', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    marginBottom: 16, 
    textAlign: 'center', 
    color: '#64748B',
    fontWeight: '500'
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    marginBottom: 24,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    backgroundColor: '#2E5BFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#2E5BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 17 
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#2E5BFF',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  passwordInput: { 
    flex: 1, 
    padding: 18, 
    fontSize: 16, 
    color: '#1E293B' 
  },
});
