import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Alert, View as RNView } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getUserData, storeAuthData, getAuthToken } from '../services/authService';

// ProfileScreen: Manage user account details and profile settings
// Features: Clean design, editable profile fields, consistent styling with app theme
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Use Tamagui theme system for consistent styling
  const theme = useTheme();
  const bg = theme.background.val;
  const cardBg = theme.backgroundHover.val;
  const border = theme.borderColor.val;
  const primaryText = theme.color.val;
  const secondaryText = theme.colorHover.val;
  const accentColor = '#3B82F6';
  
  // State for user data and editing mode
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Function to load user data from storage
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await getUserData();
      if (userData) {
        setUser(userData);
        setEditedUsername(userData.username);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save profile changes
  const handleSaveProfile = async () => {
    if (!user || !editedUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }

    try {
      // Update user data in local storage
      const updatedUser = { ...user, username: editedUsername.trim() };
      const token = await getAuthToken();
      
      if (token) {
        await storeAuthData(token, updatedUser);
        setUser(updatedUser);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile changes. Please try again.');
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditedUsername(user?.username || '');
    setIsEditing(false);
  };

  // Get user initials for avatar display
  const getUserInitials = () => {
    if (!user?.username) return 'U';
    const words = user.username.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Format role for display
  const getDisplayRole = () => {
    if (!user?.role) return 'User';
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  // Profile item component for displaying account details
  const ProfileItem = ({ 
    icon, 
    title, 
    value, 
    onPress,
    showArrow = true,
    rightElement
  }: {
    icon: string;
    title: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
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
              color={accentColor}
            />
          </View>
          <RNView style={{ flex: 1 }}>
            <Text fontSize="$4" fontWeight="500" color={primaryText}>
              {title}
            </Text>
            {value && (
              <Text fontSize="$3" color={secondaryText}>
                {value}
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

  // Profile section component for organizing content
  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
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

  // Divider component for separating items
  const Divider = () => (
    <View height={1} backgroundColor={border} />
  );

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor={bg}>
        <Text fontSize="$4" color={primaryText}>Loading profile...</Text>
      </View>
    );
  }

  // Show error state if no user data is available
  if (!user) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor={bg} padding="$4">
        <Ionicons name="person-circle" size={64} color={secondaryText} />
        <Text fontSize="$5" fontWeight="600" color={primaryText} marginTop="$4" textAlign="center">
          Profile Not Found
        </Text>
        <Text fontSize="$3" color={secondaryText} marginTop="$2" textAlign="center">
          Unable to load your profile data. Please try logging in again.
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: accentColor,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginTop: 24
          }}
        >
          <Text color="white" fontWeight="600">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }}>
      <RNView style={{ padding: 16, paddingTop: 32 }}>
        
        {/* Profile Header with Avatar and Basic Info */}
        <View 
          padding="$6" 
          borderRadius="$6" 
          marginBottom="$6" 
          backgroundColor={accentColor}
          alignItems="center"
        >
          {/* User Avatar */}
          <View 
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="white"
            borderWidth={3}
            borderColor="white"
            justifyContent="center"
            alignItems="center"
            marginBottom="$4"
          >
            <Text color={accentColor} fontWeight="bold" fontSize="$7">
              {getUserInitials()}
            </Text>
          </View>
          
          {/* User Name */}
          <Text fontSize="$6" fontWeight="bold" color="white" textAlign="center">
            {user.username}
          </Text>
          
          {/* User Role */}
          <Text fontSize="$4" color="rgba(255, 255, 255, 0.8)" textAlign="center" marginTop="$1">
            {getDisplayRole()}
          </Text>
          
          {/* Edit Profile Button */}
          <TouchableOpacity 
            onPress={() => setIsEditing(true)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Ionicons name="pencil" size={16} color="white" />
            <Text color="white" fontWeight="600" fontSize="$3">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Information Section */}
        <ProfileSection title="Account Information">
          <ProfileItem
            icon="person"
            title="Username"
            value={user.username}
            onPress={() => setIsEditing(true)}
          />
          <Divider />
          <ProfileItem
            icon="shield-checkmark"
            title="Account Type"
            value={getDisplayRole()}
            showArrow={false}
          />
          <Divider />
          <ProfileItem
            icon="calendar"
            title="Member Since"
            value="Recently joined"
            showArrow={false}
          />
        </ProfileSection>

        {/* Profile Management Section */}
        <ProfileSection title="Profile Management">
          <ProfileItem
            icon="key"
            title="Change Password"
            onPress={() => {
              Alert.alert(
                'Change Password',
                'Password change functionality will be available in a future update.',
                [{ text: 'OK' }]
              );
            }}
          />
          <Divider />
          <ProfileItem
            icon="mail"
            title="Email Settings"
            onPress={() => {
              Alert.alert(
                'Email Settings',
                'Email management will be available in a future update.',
                [{ text: 'OK' }]
              );
            }}
          />
          <Divider />
          <ProfileItem
            icon="notifications"
            title="Notification Preferences"
            onPress={() => {
              Alert.alert(
                'Notifications',
                'Notification settings can be managed in the Settings screen.',
                [
                  { text: 'Cancel' },
                  { text: 'Go to Settings', onPress: () => navigation.navigate('Settings' as never) }
                ]
              );
            }}
          />
        </ProfileSection>

        {/* Data & Privacy Section */}
        <ProfileSection title="Data & Privacy">
          <ProfileItem
            icon="download"
            title="Export Data"
            onPress={() => {
              Alert.alert(
                'Export Data',
                'Data export functionality will be available in a future update.',
                [{ text: 'OK' }]
              );
            }}
          />
          <Divider />
          <ProfileItem
            icon="trash"
            title="Delete Account"
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert(
                        'Account Deletion',
                        'Account deletion functionality will be available in a future update.',
                        [{ text: 'OK' }]
                      );
                    }
                  }
                ]
              );
            }}
          />
        </ProfileSection>
      </RNView>

      {/* Edit Profile Modal/Overlay */}
      {isEditing && (
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(0, 0, 0, 0.5)"
          justifyContent="center"
          alignItems="center"
          padding="$4"
        >
          <View
            backgroundColor={cardBg}
            borderRadius="$6"
            padding="$6"
            width="100%"
            maxWidth={400}
            borderWidth={1}
            borderColor={border}
          >
            <Text fontSize="$5" fontWeight="bold" color={primaryText} marginBottom="$4" textAlign="center">
              Edit Profile
            </Text>
            
            {/* Username Input */}
            <Text fontSize="$3" color={secondaryText} marginBottom="$2">
              Username
            </Text>
            <View
              borderWidth={1}
              borderColor={border}
              borderRadius="$3"
              padding="$3"
              marginBottom="$4"
              backgroundColor={bg}
            >
              <Text fontSize="$4" color={primaryText}>
                {editedUsername}
              </Text>
            </View>
            
            {/* Note about username editing */}
            <Text fontSize="$2" color={secondaryText} marginBottom="$4" textAlign="center" fontStyle="italic">
              Username editing will be fully functional in a future update
            </Text>
            
            {/* Action Buttons */}
            <RNView style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                onPress={handleCancelEdit}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: border,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <Text color={primaryText} fontWeight="600">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSaveProfile}
                style={{
                  flex: 1,
                  backgroundColor: accentColor,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <Text color="white" fontWeight="600">Save</Text>
              </TouchableOpacity>
            </RNView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfileScreen; 