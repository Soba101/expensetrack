import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, VStack, Heading, useColorModeValue, Link, HStack, Text, useToast } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigation = useNavigation();
  const { login } = useAuth(); // Use the login function from AuthContext
  const toast = useToast(); // useToast for displaying messages

  // Theme-aware colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');

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
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <VStack space={4} alignItems="center">
        <Heading size="xl" color={headingColor}>Welcome Back!</Heading>
        <Text fontSize="md" color={textColor}>Sign in to continue.</Text>

        <Input
          w={{ base: "95%", md: "25%" }}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <Input
          w={{ base: "95%", md: "25%" }}
          placeholder="Password"
          type="password"
          value={password}
          onChangeText={setPassword}
        />

        <Button w={{ base: "95%", md: "25%" }} onPress={handleLogin} isLoading={loading}> {/* Add isLoading prop */}
          Login
        </Button>

        <HStack mt={6} justifyContent="center">
          <Text fontSize="sm" color={textColor}>
            Don't have an account?
          </Text>
          <Link _text={{ color: 'indigo.500', fontWeight: 'medium', fontSize: 'sm' }} onPress={() => navigation.navigate('Register' as never)}>
            Sign Up
          </Link>
        </HStack>

      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoginScreen; 