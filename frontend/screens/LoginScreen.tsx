import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { View as TamaguiView, Text, useTheme } from '@tamagui/core';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { Ionicons } from '@expo/vector-icons';
// Temporarily commenting out LinearGradient to fix native module issue
// import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();
  
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

  const handleLogin = async () => {
    setLoading(true); // Set loading to true
    try {
      await login(username, password); // Call login from AuthContext
      // The AuthContext will handle navigation on success by updating isAuthenticated
    } catch (error: any) {
      // Display error message
      console.log('Login Failed:', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false); // Set loading to false
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
          <TamaguiView marginBottom="$8" alignItems="center">
            <TamaguiView
              width={80}
              height={80}
              backgroundColor="#3B82F6"
              borderRadius="$10"
              marginBottom="$4"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="wallet" size={32} color="white" />
            </TamaguiView>
            <Text fontSize="$5" fontWeight="bold" color={headingColor} textAlign="center">
              ExpenseTracker
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
            <View style={{ gap: 24, alignItems: 'center' }}>
              {/* Header */}
              <View style={{ gap: 8, alignItems: 'center' }}>
                <Text fontSize="$5" fontWeight="bold" color={headingColor}>
                  Welcome Back!
                </Text>
                <Text fontSize="$4" color={subtitleColor} textAlign="center">
                  Sign in to continue managing your expenses
                </Text>
              </View>

              {/* Input Fields */}
              <View style={{ gap: 16, width: '100%' }}>
                {/* Username Input */}
                <View>
                  <Text fontSize="$3" fontWeight="500" color={subtitleColor} marginBottom="$2">
                    Username
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={[styles.modernInput, { 
                        backgroundColor: inputBg, 
                        borderColor: inputBorder, 
                        color: inputText 
                      }]}
                      placeholder="Enter your username"
                      placeholderTextColor={iconColor}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      autoCorrect={false}
                      blurOnSubmit={false}
                    />
                    <View style={{ position: 'absolute', right: 16, top: 16 }}>
                      <Ionicons name="person-outline" size={20} color={iconColor} />
                    </View>
                  </View>
                </View>

                {/* Password Input */}
                <View>
                  <Text fontSize="$3" fontWeight="500" color={subtitleColor} marginBottom="$2">
                    Password
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={[styles.modernInput, { 
                        backgroundColor: inputBg, 
                        borderColor: inputBorder, 
                        color: inputText 
                      }]}
                      placeholder="Enter your password"
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
                  </View>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text fontSize="$4" fontWeight="bold" color="white">
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <TamaguiView flex={1} height={1} backgroundColor={inputBorder} />
                <Text marginHorizontal="$4" fontSize="$3" color={subtitleColor}>
                  or
                </Text>
                <TamaguiView flex={1} height={1} backgroundColor={inputBorder} />
              </View>

              {/* Sign Up Link */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text fontSize="$3" color={subtitleColor}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                  <Text fontSize="$3" color="#3B82F6" fontWeight="600">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#3B82F6',
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

export default LoginScreen; 