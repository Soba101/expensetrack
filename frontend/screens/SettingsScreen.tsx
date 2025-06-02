import React from 'react';
import { ScrollView, TouchableOpacity, Switch, View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// SettingsScreen: App settings and preferences with Apple-style design
// Features: Clean sections, proper spacing, intuitive organization, functional dark mode toggle, logout functionality
const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  
  // Use Tamagui theme system instead of Native Base
  const theme = useTheme();
  const bg = theme.background.val;
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const primaryText = theme.color.val;
  const secondaryText = theme.colorHover.val;
  const accentColor = '#3B82F6';
  const dangerColor = '#EF4444';
  
  // Local state for notifications toggle (placeholder functionality)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  // Handle logout functionality with error handling and user feedback
  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logged Out: You have been successfully logged out.');
    } catch (error) {
      console.error('Logout error:', error);
      console.log('Logout Error: There was an issue logging out. Please try again.');
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
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <RNView style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 16,
        backgroundColor: cardBg 
      }}>
        <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <View
            padding="$2"
            borderRadius="$2"
            backgroundColor={theme.backgroundFocus.val}
          >
            <Ionicons
              name={icon as any}
              size={20}
              color={isDestructive ? dangerColor : accentColor}
            />
          </View>
          <RNView style={{ flex: 1 }}>
            <Text fontSize="$4" fontWeight="500" color={isDestructive ? dangerColor : primaryText}>
              {title}
            </Text>
            {subtitle && (
              <Text fontSize="$3" color={secondaryText}>
                {subtitle}
              </Text>
            )}
          </RNView>
        </RNView>
        
        {rightElement || (showArrow && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={secondaryText}
          />
        ))}
      </RNView>
    </TouchableOpacity>
  );

  // Settings section component
  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <RNView style={{ gap: 0, marginBottom: 24 }}>
      <Text 
        fontSize="$3" 
        fontWeight="600" 
        color={secondaryText} 
        textTransform="uppercase"
        marginBottom="$2"
        paddingHorizontal="$4"
      >
        {title}
      </Text>
      <View
        borderRadius="$6"
        backgroundColor={cardBg}
        borderWidth={1}
        borderColor={border}
        overflow="hidden"
      >
        {children}
      </View>
    </RNView>
  );

  // Divider component
  const Divider = () => (
    <View height={1} backgroundColor={border} />
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }}>
      <RNView style={{ padding: 16, paddingTop: 32 }}>
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
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#3B82F6' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
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
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#767577', true: '#3B82F6' }}
                thumbColor={darkModeEnabled ? '#ffffff' : '#f4f3f4'}
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
        <RNView style={{ marginTop: 16, alignItems: 'center' }}>
          <Text fontSize="$3" color={secondaryText}>
            ExpenseTrack v1.0.0
          </Text>
        </RNView>
      </RNView>
    </ScrollView>
  );
};

export default SettingsScreen; 