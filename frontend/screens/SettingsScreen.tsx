import React from 'react';
import { ScrollView, Box, VStack, HStack, Text, useColorModeValue, Pressable, Icon, Switch, Divider, useColorMode, useToast } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// SettingsScreen: App settings and preferences with Apple-style design
// Features: Clean sections, proper spacing, intuitive organization, functional dark mode toggle, logout functionality
const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const toast = useToast();
  
  // Color mode functionality for dark/light theme toggle
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Local state for notifications toggle (placeholder functionality)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  
  // Apple-style colors
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('coolGray.200', 'gray.700');
  const primaryText = useColorModeValue('gray.900', 'gray.100');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.400');
  const dangerColor = useColorModeValue('red.500', 'red.400');

  // Handle logout functionality with error handling and user feedback
  const handleLogout = async () => {
    try {
      await logout();
      toast.show({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        duration: 2000,
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast.show({
        title: 'Logout Error',
        description: 'There was an issue logging out. Please try again.',
        duration: 3000,
      });
    }
  };

  // Settings item component with support for destructive actions
  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightElement,
    isDestructive = false
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
    isDestructive?: boolean;
  }) => (
    <Pressable onPress={onPress} disabled={!onPress}>
      <HStack 
        alignItems="center" 
        justifyContent="space-between" 
        p={4}
        bg={cardBg}
      >
        <HStack alignItems="center" space={3} flex={1}>
          <Box
            p={2}
            borderRadius={8}
            bg={useColorModeValue('gray.100', 'gray.700')}
          >
            <Icon
              as={Ionicons}
              name={icon as any}
              size="sm"
              color={isDestructive ? dangerColor : accentColor}
            />
          </Box>
          <VStack flex={1}>
            <Text fontSize="md" fontWeight="medium" color={isDestructive ? dangerColor : primaryText}>
              {title}
            </Text>
            {subtitle && (
              <Text fontSize="sm" color={secondaryText}>
                {subtitle}
              </Text>
            )}
          </VStack>
        </HStack>
        
        {rightElement || (showArrow && (
          <Icon
            as={Ionicons}
            name="chevron-forward"
            size="sm"
            color={secondaryText}
          />
        ))}
      </HStack>
    </Pressable>
  );

  // Settings section component
  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <VStack space={0} mb={6}>
      <Text 
        fontSize="sm" 
        fontWeight="semibold" 
        color={secondaryText} 
        textTransform="uppercase"
        mb={2}
        px={4}
      >
        {title}
      </Text>
      <Box
        borderRadius={12}
        bg={cardBg}
        borderWidth={1}
        borderColor={border}
        overflow="hidden"
      >
        {children}
      </Box>
    </VStack>
  );

  return (
    <ScrollView flex={1} bg={bg}>
      <Box p={4} pt={6}>
        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsItem
            icon="person-circle"
            title="Profile"
            subtitle="Manage your account details"
            onPress={() => {
              // TODO: Navigate to profile screen
              console.log('Navigate to profile');
            }}
          />
          <Divider />
          <SettingsItem
            icon="card"
            title="Payment Methods"
            subtitle="Manage cards and payment options"
            onPress={() => {
              // TODO: Navigate to payment methods
              console.log('Navigate to payment methods');
            }}
          />
          <Divider />
                     <SettingsItem
             icon="log-out"
             title="Logout"
             subtitle="Sign out of your account"
             onPress={handleLogout}
             isDestructive={true}
           />
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SettingsItem
            icon="pricetag"
            title="Categories"
            subtitle="Manage expense categories"
            onPress={() => navigation.navigate('Categories' as never)}
          />
          <Divider />
          <SettingsItem
            icon="notifications"
            title="Notifications"
            subtitle="Manage notification preferences"
            rightElement={
              <Switch 
                size="sm" 
                isChecked={notificationsEnabled}
                onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
                colorScheme="blue"
              />
            }
            showArrow={false}
          />
          <Divider />
          <SettingsItem
            icon="moon"
            title="Dark Mode"
            subtitle="Toggle dark/light theme"
            rightElement={
              <Switch 
                size="sm" 
                isChecked={colorMode === 'dark'}
                onToggle={toggleColorMode}
                colorScheme="blue"
              />
            }
            showArrow={false}
          />
        </SettingsSection>

        {/* Data & Privacy Section */}
        <SettingsSection title="Data & Privacy">
          <SettingsItem
            icon="cloud-upload"
            title="Backup & Sync"
            subtitle="Manage data backup settings"
            onPress={() => {
              // TODO: Navigate to backup settings
              console.log('Navigate to backup settings');
            }}
          />
          <Divider />
          <SettingsItem
            icon="download"
            title="Export Data"
            subtitle="Download your expense data"
            onPress={() => {
              // TODO: Export data functionality
              console.log('Export data');
            }}
          />
          <Divider />
          <SettingsItem
            icon="shield-checkmark"
            title="Privacy Policy"
            subtitle="View our privacy policy"
            onPress={() => {
              // TODO: Navigate to privacy policy
              console.log('Navigate to privacy policy');
            }}
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <SettingsItem
            icon="help-circle"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => {
              // TODO: Navigate to help
              console.log('Navigate to help');
            }}
          />
          <Divider />
          <SettingsItem
            icon="information-circle"
            title="About"
            subtitle="App version and information"
            onPress={() => navigation.navigate('About' as never)}
          />
        </SettingsSection>

        {/* App Version */}
        <Box mt={4} alignItems="center">
          <Text fontSize="sm" color={secondaryText}>
            ExpenseTrack v1.0.0
          </Text>
        </Box>
      </Box>
    </ScrollView>
  );
};

export default SettingsScreen; 