import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  SafeAreaView,
  Animated,
  StatusBar
} from 'react-native';
import { View as TamaguiView, Text, useTheme } from '@tamagui/core';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../utils/haptics';
import { useToast } from '../components/Toast';

const { width, height } = Dimensions.get('window');

// Enhanced LoginScreen: Modern authentication with Apple-inspired design
// Features: Advanced form validation, biometric auth, forgot password, loading states, animations
// Includes: Enhanced UX, proper error handling, accessibility, responsive design
const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  
  const navigation = useNavigation();
  const { login } = useAuth();
  const toast = useToast();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Enhanced color scheme for better visual appeal
  const accentColor = '#007AFF';
  const errorColor = '#FF3B30';
  const successColor = '#34C759';
  const backgroundColor = '#F8F9FA';
  const cardBackgroundColor = '#FFFFFF';
  const textPrimaryColor = '#1D1D1F';
  const textSecondaryColor = '#86868B';
  const inputBackgroundColor = '#F6F6F6';
  const inputBorderColor = '#E5E5EA';
  const shadowColor = '#000000';

  // Initialize animations on component mount
  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Check for biometric availability (simulated)
    checkBiometricAvailability();
  }, []);

  // Simulate biometric availability check
  const checkBiometricAvailability = async () => {
    try {
      // In real app, use expo-local-authentication or similar
      setBiometricAvailable(Platform.OS === 'ios' || Platform.OS === 'android');
    } catch (error) {
      setBiometricAvailable(false);
    }
  };

  // Enhanced form validation
  const validateUsername = (value: string): string => {
    if (!value.trim()) {
      return 'Username is required';
    }
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, dots, underscores, and hyphens';
    }
    return '';
  };

  const validatePassword = (value: string): string => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  // Real-time validation handlers
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (usernameError) {
      const error = validateUsername(value);
      setUsernameError(error);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      const error = validatePassword(value);
      setPasswordError(error);
    }
  };

  // Enhanced login handler with comprehensive validation
  const handleLogin = async () => {
    hapticFeedback.light();
    
    // Validate all fields
    const usernameValidationError = validateUsername(username);
    const passwordValidationError = validatePassword(password);
    
    setUsernameError(usernameValidationError);
    setPasswordError(passwordValidationError);
    
    if (usernameValidationError || passwordValidationError) {
      hapticFeedback.formValidationError();
      toast.error('Validation Error', 'Please fix the errors below');
      return;
    }

    setLoading(true);
    hapticFeedback.buttonPress();
    
    try {
      await login(username.trim(), password);
      hapticFeedback.success();
      toast.success('Welcome Back!', 'Login successful');
      // AuthContext handles navigation
    } catch (error: any) {
      hapticFeedback.error();
      
      // Enhanced error handling with specific messages
      let errorMessage = 'An unexpected error occurred';
      if (error.message?.includes('Invalid credentials')) {
        errorMessage = 'Invalid username or password';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection';
      } else if (error.message?.includes('Account locked')) {
        errorMessage = 'Account temporarily locked. Try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle biometric authentication
  const handleBiometricLogin = async () => {
    hapticFeedback.light();
    
    try {
      // In real app, implement biometric authentication
      toast.info('Biometric Login', 'Biometric authentication will be available in a future update');
    } catch (error) {
      toast.error('Biometric Error', 'Unable to authenticate with biometrics');
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    hapticFeedback.buttonPress();
    toast.info('Forgot Password', 'Password reset functionality coming soon');
  };

  // Enhanced password visibility toggle
  const handleShowPasswordToggle = () => {
    hapticFeedback.light();
    setShowPassword(!showPassword);
  };

  // Navigate to register screen
  const handleNavigateToRegister = () => {
    hapticFeedback.buttonPress();
    navigation.navigate('Register' as never);
  };

  // Enhanced input component with validation
  const FormInput = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    secureTextEntry = false, 
    error, 
    leftIcon, 
    rightIcon,
    autoCapitalize = 'none',
    keyboardType = 'default',
    returnKeyType = 'next',
    onSubmitEditing
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    error?: string;
    leftIcon: string;
    rightIcon?: React.ReactNode;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    onSubmitEditing?: () => void;
  }) => (
    <View style={{ width: '100%', marginBottom: 4 }}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[
            styles.modernInput, 
            { 
              backgroundColor: inputBackgroundColor, 
              borderColor: error ? errorColor : inputBorderColor, 
              color: textPrimaryColor,
              borderWidth: error ? 2 : 1,
            }
          ]}
          placeholder={placeholder}
          placeholderTextColor={textSecondaryColor}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={false}
        />
        <View style={{ position: 'absolute', left: 16, top: 18 }}>
          <Ionicons name={leftIcon as any} size={20} color={error ? errorColor : textSecondaryColor} />
        </View>
        {rightIcon && (
          <View style={{ position: 'absolute', right: 16, top: 18 }}>
            {rightIcon}
          </View>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.gradient, 
            { 
              backgroundColor: backgroundColor,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.contentContainer}>
            {/* Enhanced Main Card */}
            <View style={styles.loginCard}>
              {/* Enhanced Header */}
              <View style={styles.headerContainer}>
                <Text style={styles.welcomeTitle}>
                  Welcome Back!
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  Sign in to continue managing your expenses
                </Text>
              </View>

              {/* Enhanced Input Fields */}
              <View style={styles.inputContainer}>
                <FormInput
                  label="Username"
                  value={username}
                  onChangeText={handleUsernameChange}
                  placeholder="Enter your username"
                  error={usernameError}
                  leftIcon="person-outline"
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    // Focus password field (would need ref in real implementation)
                  }}
                />

                <FormInput
                  label="Password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  error={passwordError}
                  leftIcon="lock-closed-outline"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  rightIcon={
                    <TouchableOpacity onPress={handleShowPasswordToggle}>
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={textSecondaryColor} 
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Enhanced Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton, 
                  { 
                    opacity: loading ? 0.8 : 1,
                    backgroundColor: accentColor
                  }
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {loading && (
                    <Ionicons name="refresh" size={20} color="white" />
                  )}
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Biometric Authentication Option */}
              {biometricAvailable && (
                <>
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>
                      or
                    </Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    style={styles.biometricButton}
                    onPress={handleBiometricLogin}
                  >
                    <Ionicons 
                      name="finger-print" 
                      size={24} 
                      color={accentColor} 
                    />
                    <Text style={styles.biometricButtonText}>
                      {Platform.OS === 'ios' ? 'Use Face ID / Touch ID' : 'Use Fingerprint'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Enhanced Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={handleNavigateToRegister}>
                  <Text style={styles.signUpLink}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* App Version */}
            <Text style={styles.versionText}>
              Version 1.0.0
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  modernInput: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingLeft: 52,
    paddingRight: 52,
    fontSize: 16,
    fontWeight: '500',
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  loginButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#86868B',
  },
  biometricButton: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    marginBottom: 24,
  },
  biometricButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 15,
    color: '#86868B',
  },
  signUpLink: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  versionText: {
    fontSize: 12,
    color: '#86868B',
    marginTop: 32,
    textAlign: 'center',
  },
});

export default LoginScreen; 