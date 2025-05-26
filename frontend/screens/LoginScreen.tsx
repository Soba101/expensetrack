import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, VStack, Heading, useColorModeValue, Link, HStack, Text, useToast, Box, Icon, Center, Pressable } from 'native-base';
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

  const handleLogin = async () => {
    setLoading(true); // Set loading to true
    try {
      await login(username, password); // Call login from AuthContext
      // The AuthContext will handle navigation on success by updating isAuthenticated
    } catch (error: any) {
      // Display error message
      toast.show({
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
        duration: 3000,
      });
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
        style={[styles.gradient, { backgroundColor: bgGradient[0] }]}
      >
        <Center flex={1} px={6}>
          {/* App Logo/Icon */}
          <Box mb={8}>
            <Center
              w={20}
              h={20}
              bg="blue.500"
              borderRadius="full"
              shadow={3}
              mb={4}
            >
              <Icon as={Ionicons} name="wallet" size="xl" color="white" />
            </Center>
            <Text fontSize="lg" fontWeight="bold" color={headingColor} textAlign="center">
              ExpenseTracker
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
                  Welcome Back!
                </Heading>
                <Text fontSize="md" color={subtitleColor} textAlign="center">
                  Sign in to continue managing your expenses
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
                      placeholder="Enter your username"
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
                      placeholder="Enter your password"
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
              </VStack>

              {/* Login Button */}
              <Button
                w="100%"
                h={12}
                bg="blue.500"
                borderRadius="xl"
                onPress={handleLogin}
                isLoading={loading}
                _pressed={{ bg: "blue.600" }}
                _text={{ 
                  fontSize: "md", 
                  fontWeight: "bold",
                  color: "white"
                }}
                shadow={3}
              >
                Sign In
              </Button>

              {/* Divider */}
              <HStack alignItems="center" w="100%">
                <Box flex={1} h="1px" bg={inputBorder} />
                <Text mx={4} fontSize="sm" color={subtitleColor}>
                  or
                </Text>
                <Box flex={1} h="1px" bg={inputBorder} />
              </HStack>

              {/* Sign Up Link */}
              <HStack justifyContent="center" alignItems="center">
                <Text fontSize="sm" color={subtitleColor}>
                  Don't have an account?{' '}
                </Text>
                <Pressable onPress={() => navigation.navigate('Register' as never)}>
                  <Text fontSize="sm" color="blue.500" fontWeight="semibold">
                    Sign Up
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

export default LoginScreen; 