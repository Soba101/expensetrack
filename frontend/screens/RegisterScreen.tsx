import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity, View as RNView } from 'react-native';
import { View as TamaguiView, Text, useTheme } from '@tamagui/core';
import { useNavigation } from '@react-navigation/native';
import * as authService from '../services/authService'; // Import authService
import { Ionicons } from '@expo/vector-icons';
// Temporarily commenting out LinearGradient to fix native module issue
// import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const RegisterScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation();

  // Use Tamagui theme system instead of Native Base
  const theme = useTheme();
  const cardBg = theme.backgroundHover.val;
  const headingColor = theme.color.val;
  const subtitleColor = theme.colorHover.val;
  const inputBg = theme.background.val;
  const inputBorder = theme.borderColor.val;
  const inputText = theme.color.val;
  const iconColor = theme.colorHover.val;
  const shadowColor = theme.borderColor.val;

  const handleRegister = async () => {
    // Validate password confirmation
    if (password !== confirmPassword) {
      console.log('Password Mismatch: Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 6) {
      console.log('Password Too Short: Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await authService.register(username, password);
      console.log('Registration Successful: You can now log in with your new account.');
      navigation.navigate('Login' as never);
    } catch (error: any) {
      console.log('Registration Failed:', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[styles.gradient, { backgroundColor: theme.background.val }]}
      >
        <TamaguiView flex={1} paddingHorizontal="$6" justifyContent="center" alignItems="center">
          {/* App Logo/Icon */}
          <TamaguiView marginBottom="$6" alignItems="center">
            <TamaguiView
              width={80}
              height={80}
              backgroundColor="#10B981"
              borderRadius="$10"
              marginBottom="$4"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="person-add" size={32} color="white" />
            </TamaguiView>
            <Text fontSize="$5" fontWeight="bold" color={headingColor} textAlign="center">
              Join ExpenseTracker
            </Text>
          </TamaguiView>

          {/* Main Card */}
          <TamaguiView
            width="100%"
            maxWidth={400}
            backgroundColor={cardBg}
            borderRadius="$8"
            padding="$8"
            borderWidth={1}
            borderColor={shadowColor}
          >
            <RNView style={{ gap: 24, alignItems: 'center' }}>
              {/* Header */}
              <RNView style={{ gap: 8, alignItems: 'center' }}>
                <Text fontSize="$6" fontWeight="bold" color={headingColor}>
                  Create Account
                </Text>
                <Text fontSize="$4" color={subtitleColor} textAlign="center">
                  Start your journey to better expense management
                </Text>
              </RNView>

              {/* Input Fields */}
              <RNView style={{ gap: 16, width: '100%' }}>
                {/* Username Input */}
                <RNView>
                  <Text fontSize="$3" fontWeight="500" color={subtitleColor} marginBottom="$2">
                    Username
                  </Text>
                  <RNView style={{ position: 'relative' }}>
                    <TextInput
                      style={[styles.modernInput, { 
                        backgroundColor: inputBg, 
                        borderColor: inputBorder, 
                        color: inputText 
                      }]}
                      placeholder="Choose a username"
                      placeholderTextColor={iconColor}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      autoCorrect={false}
                      blurOnSubmit={false}
                    />
                    <RNView style={{ position: 'absolute', right: 16, top: 16 }}>
                      <Ionicons name="person-outline" size={20} color={iconColor} />
                    </RNView>
                  </RNView>
                </RNView>

                {/* Password Input */}
                <RNView>
                  <Text fontSize="$3" fontWeight="500" color={subtitleColor} marginBottom="$2">
                    Password
                  </Text>
                  <RNView style={{ position: 'relative' }}>
                    <TextInput
                      style={[styles.modernInput, { 
                        backgroundColor: inputBg, 
                        borderColor: inputBorder, 
                        color: inputText 
                      }]}
                      placeholder="Create a password"
                      placeholderTextColor={iconColor}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      blurOnSubmit={false}
                    />
                    <TouchableOpacity 
                      style={{ position: 'absolute', right: 16, top: 16 }}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={iconColor} 
                      />
                    </TouchableOpacity>
                  </RNView>
                </RNView>

                {/* Confirm Password Input */}
                <RNView>
                  <Text fontSize="$3" fontWeight="500" color={subtitleColor} marginBottom="$2">
                    Confirm Password
                  </Text>
                  <RNView style={{ position: 'relative' }}>
                    <TextInput
                      style={[styles.modernInput, { 
                        backgroundColor: inputBg, 
                        borderColor: inputBorder, 
                        color: inputText 
                      }]}
                      placeholder="Confirm your password"
                      placeholderTextColor={iconColor}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      blurOnSubmit={false}
                    />
                    <TouchableOpacity 
                      style={{ position: 'absolute', right: 16, top: 16 }}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={iconColor} 
                      />
                    </TouchableOpacity>
                  </RNView>
                </RNView>
              </RNView>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text fontSize="$4" fontWeight="bold" color="white">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <RNView style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <TamaguiView flex={1} height={1} backgroundColor={inputBorder} />
                <Text marginHorizontal="$4" fontSize="$3" color={subtitleColor}>
                  or
                </Text>
                <TamaguiView flex={1} height={1} backgroundColor={inputBorder} />
              </RNView>

              {/* Sign In Link */}
              <RNView style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text fontSize="$3" color={subtitleColor}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                  <Text fontSize="$3" color="#10B981" fontWeight="600">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </RNView>
            </RNView>
          </TamaguiView>
        </TamaguiView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  modernInput: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingRight: 50, // Space for icon
    fontSize: 16,
    width: '100%',
    fontWeight: '500',
  },
  registerButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    width: '100%',
  },
});

export default RegisterScreen; 