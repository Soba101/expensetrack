import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, VStack, Heading, useColorModeValue, Link, HStack, Text, useToast } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import * as authService from '../services/authService'; // Import authService

const RegisterScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigation = useNavigation();
  const toast = useToast(); // useToast for displaying messages

  // Theme-aware colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleRegister = async () => {
    setLoading(true); // Set loading to true
    try {
      await authService.register(username, password); // Call register from authService
      // Display success message
      toast.show({
        title: 'Registration Successful',
        description: 'You can now log in.',
        duration: 3000,
      });
      // Navigate to Login screen after successful registration
      navigation.navigate('Login' as never);
    } catch (error: any) {
      // Display error message
      toast.show({
        title: 'Registration Failed',
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
        <Heading size="xl" color={headingColor}>Create Account</Heading>
        <Text fontSize="md" color={textColor}>Sign up to get started.</Text>

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

        <Button w={{ base: "95%", md: "25%" }} onPress={handleRegister} isLoading={loading}> {/* Add isLoading prop */}
          Register
        </Button>

        <HStack mt={6} justifyContent="center">
          <Text fontSize="sm" color={textColor}>
            Already have an account?
          </Text>
          <Link _text={{ color: 'indigo.500', fontWeight: 'medium', fontSize: 'sm' }} onPress={() => navigation.navigate('Login' as never)}>
            Sign In
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

export default RegisterScreen; 