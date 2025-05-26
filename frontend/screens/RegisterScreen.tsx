import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, VStack, Heading, useColorModeValue, Link, HStack, Text, useToast, Box, Icon, Center, Pressable } from 'native-base';
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
  const toast = useToast();

  // Enhanced theme-aware colors for modern design
  const bgGradient = useColorModeValue(['#f8fafc', '#e2e8f0'], ['#1a202c', '#2d3748']);
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.900', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.300');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const inputBorder = useColorModeValue('gray.200', 'gray.600');
  const inputFocusBorder = useColorModeValue('blue.500', 'blue.400');
  const inputText = useColorModeValue('gray.900', 'gray.100');
  const iconColor = useColorModeValue('gray.400', 'gray.500');
  const shadowColor = useColorModeValue('gray.200', 'gray.900');

  const handleRegister = async () => {
    // Validate password confirmation
    if (password !== confirmPassword) {
      toast.show({
        title: 'Password Mismatch',
        description: 'Passwords do not match. Please try again.',
        duration: 3000,
      });
      return;
    }

    if (password.length < 6) {
      toast.show({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      await authService.register(username, password);
      toast.show({
        title: 'Registration Successful',
        description: 'You can now log in with your new account.',
        duration: 3000,
      });
      navigation.navigate('Login' as never);
    } catch (error: any) {
      toast.show({
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred.',
        duration: 3000,
      });
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
        style={[styles.gradient, { backgroundColor: bgGradient[0] }]}
      >
        <Center flex={1} px={6}>
          {/* App Logo/Icon */}
          <Box mb={6}>
            <Center
              w={20}
              h={20}
              bg="green.500"
              borderRadius="full"
              shadow={3}
              mb={4}
            >
              <Icon as={Ionicons} name="person-add" size="xl" color="white" />
            </Center>
            <Text fontSize="lg" fontWeight="bold" color={headingColor} textAlign="center">
              Join ExpenseTracker
            </Text>
          </Box>

          {/* Main Card */}
          <Box
            w="100%"
            maxW="400px"
            bg={cardBg}
            borderRadius="3xl"
            p={8}
            shadow={9}
            borderWidth={1}
            borderColor={shadowColor}
          >
            <VStack space={6} alignItems="center">
              {/* Header */}
              <VStack space={2} alignItems="center">
                <Heading size="xl" color={headingColor} fontWeight="bold">
                  Create Account
                </Heading>
                <Text fontSize="md" color={subtitleColor} textAlign="center">
                  Start your journey to better expense management
                </Text>
              </VStack>

              {/* Input Fields */}
              <VStack space={4} w="100%">
                {/* Username Input */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={subtitleColor} mb={2}>
                    Username
                  </Text>
                  <Box position="relative">
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
                    <Box position="absolute" right={4} top={4}>
                      <Icon as={Ionicons} name="person-outline" size="sm" color={iconColor} />
                    </Box>
                  </Box>
                </Box>

                {/* Password Input */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={subtitleColor} mb={2}>
                    Password
                  </Text>
                  <Box position="relative">
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
                    <Pressable 
                      position="absolute" 
                      right={4} 
                      top={4}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Icon 
                        as={Ionicons} 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size="sm" 
                        color={iconColor} 
                      />
                    </Pressable>
                  </Box>
                </Box>

                {/* Confirm Password Input */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={subtitleColor} mb={2}>
                    Confirm Password
                  </Text>
                  <Box position="relative">
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
                    <Pressable 
                      position="absolute" 
                      right={4} 
                      top={4}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Icon 
                        as={Ionicons} 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size="sm" 
                        color={iconColor} 
                      />
                    </Pressable>
                  </Box>
                </Box>
              </VStack>

              {/* Register Button */}
              <Button
                w="100%"
                h={12}
                bg="green.500"
                borderRadius="xl"
                onPress={handleRegister}
                isLoading={loading}
                _pressed={{ bg: "green.600" }}
                _text={{ 
                  fontSize: "md", 
                  fontWeight: "bold",
                  color: "white"
                }}
                shadow={3}
              >
                Create Account
              </Button>

              {/* Divider */}
              <HStack alignItems="center" w="100%">
                <Box flex={1} h="1px" bg={inputBorder} />
                <Text mx={4} fontSize="sm" color={subtitleColor}>
                  or
                </Text>
                <Box flex={1} h="1px" bg={inputBorder} />
              </HStack>

              {/* Sign In Link */}
              <HStack justifyContent="center" alignItems="center">
                <Text fontSize="sm" color={subtitleColor}>
                  Already have an account?{' '}
                </Text>
                <Pressable onPress={() => navigation.navigate('Login' as never)}>
                  <Text fontSize="sm" color="green.500" fontWeight="semibold">
                    Sign In
                  </Text>
                </Pressable>
              </HStack>
            </VStack>
          </Box>
        </Center>
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