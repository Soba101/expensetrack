import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  View as RNView,
  StatusBar,
  Animated,
  SafeAreaView
} from 'react-native';
import { View as TamaguiView, Text, useTheme } from '@tamagui/core';
import { useNavigation } from '@react-navigation/native';
import * as authService from '../services/authService';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message'; 

const { width, height } = Dimensions.get('window');

// Validation helper functions
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

const validateUsername = (username: string): string | null => {
  if (!username.trim()) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 20) return 'Username must be less than 20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 50) return 'Password must be less than 50 characters';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  return null;
};

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  const navigation = useNavigation();

  // Use Tamagui theme system
  const theme = useTheme();
  const cardBg = theme.backgroundHover.val;
  const headingColor = theme.color.val;
  const subtitleColor = theme.colorHover.val;
  const inputBg = theme.background.val;
  const inputBorder = theme.borderColor.val;
  const inputText = theme.color.val;
  const iconColor = theme.colorHover.val;
  const shadowColor = theme.borderColor.val;
  const errorColor = '#FF3B30';
  const successColor = '#10B981';

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Real-time validation
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.trim()) {
      setEmailError(validateEmail(text));
    } else {
      setEmailError(null);
    }
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (text.trim()) {
      setUsernameError(validateUsername(text));
    } else {
      setUsernameError(null);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text) {
      setPasswordError(validatePassword(text));
    } else {
      setPasswordError(null);
    }
    
    // Also validate confirm password if it exists
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword && text === confirmPassword) {
      setConfirmPasswordError(null);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (text && password !== text) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleTermsToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAcceptTerms(!acceptTerms);
    if (!acceptTerms) {
      setTermsError(null);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate email
    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      isValid = false;
    }
    
    // Validate username
    const usernameErr = validateUsername(username);
    if (usernameErr) {
      setUsernameError(usernameErr);
      isValid = false;
    }
    
    // Validate password
    const passwordErr = validatePassword(password);
    if (passwordErr) {
      setPasswordError(passwordErr);
      isValid = false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    // Validate terms acceptance
    if (!acceptTerms) {
      setTermsError('You must accept the terms and conditions');
      isValid = false;
    }
    
    return isValid;
  };

  const handleRegister = async () => {
    // Haptic feedback for button press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Validate form
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'Please fix the errors above and try again.',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      await authService.register(username, password, email);
      
      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Toast.show({
        type: 'success',
        text1: 'Registration Successful! 🎉',
        text2: 'Welcome to ExpenseTracker! You can now log in.',
        position: 'top',
        topOffset: 60,
      });
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigation.navigate('Login' as never);
      }, 1500);
      
    } catch (error: any) {
      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      // Handle specific error cases
      if (error.message?.includes('username')) {
        errorMessage = 'Username is already taken. Please choose a different one.';
        setUsernameError('Username is already taken');
      } else if (error.message?.includes('email')) {
        errorMessage = 'Email is already registered. Please use a different email.';
        setEmailError('Email is already registered');
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowConfirmPassword(!showConfirmPassword);
  };

  const navigateToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Login' as never);
  };

  const isFormValid = !emailError && !usernameError && !passwordError && !confirmPasswordError && 
                     email.trim() && username.trim() && password && confirmPassword && acceptTerms;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background.val} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.gradient, 
            { 
              backgroundColor: theme.background.val,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TamaguiView flex={1} paddingHorizontal="$6" justifyContent="center" alignItems="center">
            {/* Header */}
            <TamaguiView marginBottom="$6" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color={headingColor} textAlign="center">
                Join Us
              </Text>
              <Text fontSize="$3" color={subtitleColor} textAlign="center" marginTop="$2">
                Your journey to better financial management starts here
              </Text>
            </TamaguiView>

            {/* Main Card */}
            <TamaguiView
              width="100%"
              maxWidth={400}
              backgroundColor={cardBg}
              borderRadius="$8"
              padding="$8"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.1}
              shadowRadius={12}
            >
              <RNView style={{ gap: 24, alignItems: 'center' }}>
                {/* Input Fields */}
                <RNView style={{ gap: 16, width: '100%' }}>
                  {/* Email Input */}
                  <RNView>
                    <Text fontSize="$3" fontWeight="500" color={subtitleColor} marginBottom="$2">
                      Email Address
                    </Text>
                    <RNView style={{ position: 'relative' }}>
                      <TextInput
                        style={[
                          styles.modernInput, 
                          { 
                            backgroundColor: inputBg, 
                            borderColor: emailError ? errorColor : inputBorder, 
                            color: inputText 
                          }
                        ]}
                        placeholder="Enter your email address"
                        placeholderTextColor={iconColor}
                        value={email}
                        onChangeText={handleEmailChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        blurOnSubmit={false}
                        returnKeyType="next"
                      />
                      <RNView style={{ position: 'absolute', right: 16, top: 16 }}>
                        <Ionicons 
                          name={emailError ? "alert-circle" : "mail-outline"} 
                          size={20} 
                          color={emailError ? errorColor : iconColor} 
                        />
                      </RNView>
                    </RNView>
                    {emailError && (
                      <Text fontSize="$2" color={errorColor} marginTop="$1">
                        {emailError}
                      </Text>
                    )}
                  </RNView>

                  {/* Username Input */}
                  <RNView>
                    <Text fontSize="$3" fontWeight="500" color={subtitleColor} marginBottom="$2">
                      Username
                    </Text>
                    <RNView style={{ position: 'relative' }}>
                      <TextInput
                        style={[
                          styles.modernInput, 
                          { 
                            backgroundColor: inputBg, 
                            borderColor: usernameError ? errorColor : inputBorder, 
                            color: inputText 
                          }
                        ]}
                        placeholder="Choose a unique username"
                        placeholderTextColor={iconColor}
                        value={username}
                        onChangeText={handleUsernameChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                        blurOnSubmit={false}
                        returnKeyType="next"
                      />
                      <RNView style={{ position: 'absolute', right: 16, top: 16 }}>
                        <Ionicons 
                          name={usernameError ? "alert-circle" : "person-outline"} 
                          size={20} 
                          color={usernameError ? errorColor : iconColor} 
                        />
                      </RNView>
                    </RNView>
                    {usernameError && (
                      <Text fontSize="$2" color={errorColor} marginTop="$1">
                        {usernameError}
                      </Text>
                    )}
                  </RNView>

                  {/* Password Input */}
                  <RNView>
                    <Text fontSize="$3" fontWeight="500" color={subtitleColor} marginBottom="$2">
                      Password
                    </Text>
                    <RNView style={{ position: 'relative' }}>
                      <TextInput
                        style={[
                          styles.modernInput, 
                          { 
                            backgroundColor: inputBg, 
                            borderColor: passwordError ? errorColor : inputBorder, 
                            color: inputText 
                          }
                        ]}
                        placeholder="Create a strong password"
                        placeholderTextColor={iconColor}
                        value={password}
                        onChangeText={handlePasswordChange}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        blurOnSubmit={false}
                        returnKeyType="next"
                      />
                      <TouchableOpacity 
                        style={{ position: 'absolute', right: 16, top: 16 }}
                        onPress={togglePasswordVisibility}
                      >
                        <Ionicons 
                          name={passwordError ? "alert-circle" : (showPassword ? "eye-off-outline" : "eye-outline")} 
                          size={20} 
                          color={passwordError ? errorColor : iconColor} 
                        />
                      </TouchableOpacity>
                    </RNView>
                    {passwordError && (
                      <Text fontSize="$2" color={errorColor} marginTop="$1">
                        {passwordError}
                      </Text>
                    )}
                  </RNView>

                  {/* Confirm Password Input */}
                  <RNView>
                    <Text fontSize="$3" fontWeight="500" color={subtitleColor} marginBottom="$2">
                      Confirm Password
                    </Text>
                    <RNView style={{ position: 'relative' }}>
                      <TextInput
                        style={[
                          styles.modernInput, 
                          { 
                            backgroundColor: inputBg, 
                            borderColor: confirmPasswordError ? errorColor : inputBorder, 
                            color: inputText 
                          }
                        ]}
                        placeholder="Confirm your password"
                        placeholderTextColor={iconColor}
                        value={confirmPassword}
                        onChangeText={handleConfirmPasswordChange}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        blurOnSubmit={false}
                        returnKeyType="done"
                      />
                      <TouchableOpacity 
                        style={{ position: 'absolute', right: 16, top: 16 }}
                        onPress={toggleConfirmPasswordVisibility}
                      >
                        <Ionicons 
                          name={confirmPasswordError ? "alert-circle" : (showConfirmPassword ? "eye-off-outline" : "eye-outline")} 
                          size={20} 
                          color={confirmPasswordError ? errorColor : iconColor} 
                        />
                      </TouchableOpacity>
                    </RNView>
                    {confirmPasswordError && (
                      <Text fontSize="$2" color={errorColor} marginTop="$1">
                        {confirmPasswordError}
                      </Text>
                    )}
                  </RNView>

                  {/* Terms and Conditions */}
                  <RNView>
                    <TouchableOpacity 
                      style={styles.termsContainer}
                      onPress={handleTermsToggle}
                    >
                      <RNView style={[
                        styles.checkbox, 
                        { 
                          borderColor: termsError ? errorColor : inputBorder,
                          backgroundColor: acceptTerms ? successColor : 'transparent'
                        }
                      ]}>
                        {acceptTerms && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </RNView>
                      <Text fontSize="$3" color={subtitleColor} flex={1} marginLeft="$3">
                        I agree to the{' '}
                        <Text color={successColor} fontWeight="600">Terms of Service</Text>
                        {' '}and{' '}
                        <Text color={successColor} fontWeight="600">Privacy Policy</Text>
                      </Text>
                    </TouchableOpacity>
                    {termsError && (
                      <Text fontSize="$2" color={errorColor} marginTop="$1">
                        {termsError}
                      </Text>
                    )}
                  </RNView>
                </RNView>

                {/* Register Button */}
                <TouchableOpacity
                  style={[
                    styles.registerButton, 
                    { 
                      opacity: loading ? 0.7 : (isFormValid ? 1 : 0.5),
                      backgroundColor: isFormValid ? successColor : '#A0A0A0'
                    }
                  ]}
                  onPress={handleRegister}
                  disabled={loading || !isFormValid}
                >
                  <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {loading && (
                      <RNView style={{ marginRight: 8 }}>
                        <Ionicons name="hourglass-outline" size={20} color="white" />
                      </RNView>
                    )}
                    <Text fontSize="$4" fontWeight="bold" color="white">
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </RNView>
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
                  <TouchableOpacity onPress={navigateToLogin}>
                    <Text fontSize="$3" color={successColor} fontWeight="600">
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </RNView>
              </RNView>
            </TamaguiView>
          </TamaguiView>
        </Animated.View>
      </KeyboardAvoidingView>
      
      {/* Toast Message Component */}
      <Toast />
    </SafeAreaView>
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
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
});

export default RegisterScreen; 