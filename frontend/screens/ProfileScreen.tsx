import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Alert, View as RNView, TextInput, RefreshControl } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';
import { getUserData, storeAuthData, getAuthToken } from '../services/authService';

// Define the navigation stack type
type RootStackParamList = {
  Home: undefined;
  ExpenseDetail: { expenseId: string };
  ExpensesList: undefined;
  AddEditExpense: { expenseId?: string } | undefined;
  Categories: undefined;
  Reports: undefined;
  Profile: undefined;
  Settings: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

// ProfileScreen: Manage user account details and profile settings
// Features: Apple-inspired design, editable profile fields, haptic feedback, toast notifications
// Enhanced with skeleton loading, proper navigation, and consistent styling
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  // Enhanced theme setup with iOS colors
  const theme = useTheme();
  const bg = '#F2F2F7'; // iOS background
  const cardBg = '#FFFFFF';
  const border = '#E5E5EA';
  const primaryText = '#000000';
  const secondaryText = '#8E8E93';
  const accentColor = '#007AFF';
  const successColor = '#34C759';
  const errorColor = '#FF3B30';
  
  // State for user data and editing mode
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Function to load user data from storage with enhanced error handling
  const loadUserData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        setIsLoading(true);
      }
      
      const userData = await getUserData();
      if (userData) {
        setUser(userData);
        setEditedUsername(userData.username);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      showErrorToast('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh with haptic feedback
  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadUserData(true);
  };

  // Handle back navigation
  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  // Function to save profile changes with enhanced feedback
  const handleSaveProfile = async () => {
    if (!user || !editedUsername.trim()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showErrorToast('Error', 'Username cannot be empty.');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Update user data in local storage
      const updatedUser = { ...user, username: editedUsername.trim() };
      const token = await getAuthToken();
      
      if (token) {
        await storeAuthData(token, updatedUser);
        setUser(updatedUser);
        setIsEditing(false);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccessToast('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showErrorToast('Error', 'Failed to save profile changes. Please try again.');
    }
  };

  // Function to cancel editing with haptic feedback
  const handleCancelEdit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditedUsername(user?.username || '');
    setIsEditing(false);
  };

  // Handle edit button press
  const handleEditPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(true);
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

  // Enhanced profile item component with better styling
  const ProfileItem = ({ 
    icon, 
    title, 
    value, 
    onPress,
    showArrow = true,
    rightElement,
    isDestructive = false
  }: {
    icon: string;
    title: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity 
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }} 
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <RNView style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: cardBg 
      }}>
        <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
          <View
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor={isDestructive ? '#FFEBEE' : '#F0F9FF'}
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons
              name={icon as any}
              size={20}
              color={isDestructive ? errorColor : accentColor}
            />
          </View>
          <RNView style={{ flex: 1 }}>
            <Text 
              fontSize="$4" 
              fontWeight="500" 
              color={isDestructive ? errorColor : primaryText}
            >
              {title}
            </Text>
            {value && (
              <Text fontSize="$3" color={secondaryText} marginTop={2}>
                {value}
              </Text>
            )}
          </RNView>
        </RNView>
        
        {rightElement || (showArrow && onPress && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={secondaryText}
          />
        ))}
      </RNView>
    </TouchableOpacity>
  );

  // Enhanced profile section component
  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <RNView style={{ marginBottom: 32 }}>
      <Text 
        fontSize="$3" 
        fontWeight="600" 
        color={secondaryText} 
        textTransform="uppercase"
        marginBottom="$3"
        paddingHorizontal="$4"
        letterSpacing={0.5}
      >
        {title}
      </Text>
      <View
        borderRadius="$4"
        backgroundColor={cardBg}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.1}
        shadowRadius={3}
        overflow="hidden"
      >
        {children}
      </View>
    </RNView>
  );

  // Enhanced divider component
  const Divider = () => (
    <View height={1} backgroundColor={border} marginLeft={72} />
  );

  // Render skeleton loading state
  const renderSkeletonLoading = () => (
    <View flex={1} backgroundColor={bg}>
      {/* Header Skeleton */}
      <RNView style={{ 
        flexDirection: 'row', 
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 64,
        paddingBottom: 16
      }}>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
        <RNView style={{ marginLeft: 16 }}>
          <SkeletonLoader width={150} height={28} borderRadius={8} />
        </RNView>
      </RNView>

      <ScrollView style={{ padding: 16 }}>
        {/* Profile Header Skeleton */}
        <RNView style={{ 
          alignItems: 'center', 
          padding: 32, 
          marginBottom: 32,
          backgroundColor: cardBg,
          borderRadius: 16
        }}>
          <SkeletonLoader width={80} height={80} borderRadius={40} />
          <RNView style={{ marginTop: 16 }}>
            <SkeletonLoader width={120} height={24} borderRadius={8} />
          </RNView>
          <RNView style={{ marginTop: 8 }}>
            <SkeletonLoader width={80} height={16} borderRadius={8} />
          </RNView>
          <RNView style={{ marginTop: 16 }}>
            <SkeletonLoader width={100} height={32} borderRadius={16} />
          </RNView>
        </RNView>

        {/* Sections Skeleton */}
        {[1, 2, 3].map((section) => (
          <RNView key={section} style={{ marginBottom: 32 }}>
            <RNView style={{ marginBottom: 12 }}>
              <SkeletonLoader width={120} height={16} borderRadius={8} />
            </RNView>
            <RNView style={{ backgroundColor: cardBg, borderRadius: 12, overflow: 'hidden' }}>
              {[1, 2, 3].map((item) => (
                <RNView key={item} style={{ padding: 16 }}>
                  <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <SkeletonLoader width={36} height={36} borderRadius={18} />
                    <RNView style={{ marginLeft: 16, flex: 1 }}>
                      <SkeletonLoader width="60%" height={16} borderRadius={8} />
                      <RNView style={{ marginTop: 4 }}>
                        <SkeletonLoader width="40%" height={12} borderRadius={6} />
                      </RNView>
                    </RNView>
                  </RNView>
                </RNView>
              ))}
            </RNView>
          </RNView>
        ))}
      </ScrollView>
    </View>
  );

  // Show loading state while data is being fetched
  if (isLoading) {
    return renderSkeletonLoading();
  }

  // Show error state if no user data is available
  if (!user) {
    return (
      <View flex={1} backgroundColor={bg}>
        {/* Header */}
        <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
          {/* Back Button Row */}
          <RNView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color="#007AFF" />
            </TouchableOpacity>
          </RNView>

          {/* Title Row */}
          <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <RNView style={{ flex: 1 }}>
              <Text fontSize={34} fontWeight="bold" color="#000000" marginBottom={4}>
                Profile
              </Text>
              <Text fontSize={17} color="#8E8E93" fontWeight="400">
                Unable to load profile data
              </Text>
            </RNView>
          </RNView>
        </View>

        <View flex={1} justifyContent="center" alignItems="center" padding="$6">
          <View
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="#F2F2F7"
            alignItems="center"
            justifyContent="center"
            marginBottom="$4"
          >
            <Ionicons name="person-circle" size={40} color={secondaryText} />
          </View>
          <Text fontSize="$5" fontWeight="600" color={primaryText} textAlign="center" marginBottom="$2">
            Profile Not Found
          </Text>
          <Text fontSize="$3" color={secondaryText} textAlign="center" lineHeight="$4" marginBottom="$6">
            Unable to load your profile data. Please try logging in again.
          </Text>
          <TouchableOpacity 
            onPress={() => {
              navigation.goBack();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }} 
            activeOpacity={0.7}
          >
            <View
              paddingHorizontal="$6"
              paddingVertical="$3"
              borderRadius="$6"
              backgroundColor={accentColor}
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={4}
            >
              <Text fontSize="$3" fontWeight="600" color="white">
                Go Back
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor={bg}>
      {/* Enhanced Header with Back Navigation */}
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        {/* Back Button Row */}
        <RNView style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(0, 122, 255, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color="#007AFF" />
          </TouchableOpacity>
        </RNView>

        {/* Title Row */}
        <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <RNView style={{ flex: 1 }}>
            <Text fontSize={34} fontWeight="bold" color="#000000" marginBottom={4}>
              Profile
            </Text>
            <Text fontSize={17} color="#8E8E93" fontWeight="400">
              {user ? `Manage your account settings` : 'Loading profile...'}
            </Text>
          </RNView>
        </RNView>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={accentColor}
            colors={[accentColor]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <RNView style={{ padding: 16 }}>
          
          {/* Enhanced Profile Header with Avatar and Basic Info */}
          <View 
            padding="$6" 
            borderRadius="$4" 
            marginBottom="$6" 
            backgroundColor={accentColor}
            alignItems="center"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.15}
            shadowRadius={8}
          >
            {/* User Avatar */}
            <View 
              width={100}
              height={100}
              borderRadius={50}
              backgroundColor="white"
              borderWidth={4}
              borderColor="rgba(255, 255, 255, 0.3)"
              justifyContent="center"
              alignItems="center"
              marginBottom="$4"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={4}
            >
              <Text color={accentColor} fontWeight="bold" fontSize="$8">
                {getUserInitials()}
              </Text>
            </View>
            
            {/* User Name */}
            <Text fontSize="$7" fontWeight="700" color="white" textAlign="center" marginBottom="$1">
              {user.username}
            </Text>
            
            {/* User Role */}
            <Text fontSize="$4" color="rgba(255, 255, 255, 0.8)" textAlign="center" marginBottom="$4">
              {getDisplayRole()}
            </Text>
            
            {/* Edit Profile Button */}
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsEditing(true);
              }}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 24,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)'
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
              onPress={handleEditPress}
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
                showErrorToast(
                  'Coming Soon',
                  'Password change functionality will be available in a future update.'
                );
              }}
            />
            <Divider />
            <ProfileItem
              icon="mail"
              title="Email Settings"
              onPress={() => {
                showErrorToast(
                  'Coming Soon',
                  'Email management will be available in a future update.'
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
                showErrorToast(
                  'Coming Soon',
                  'Data export functionality will be available in a future update.'
                );
              }}
            />
            <Divider />
            <ProfileItem
              icon="trash"
              title="Delete Account"
              isDestructive={true}
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
                        showErrorToast(
                          'Coming Soon',
                          'Account deletion functionality will be available in a future update.'
                        );
                      }
                    }
                  ]
                );
              }}
            />
          </ProfileSection>

          {/* Bottom Spacing for Safe Area */}
          <RNView style={{ height: 40 }} />
        </RNView>
      </ScrollView>

      {/* Enhanced Edit Profile Modal */}
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
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 8 }}
            shadowOpacity={0.25}
            shadowRadius={16}
          >
            <Text fontSize="$6" fontWeight="700" color={primaryText} marginBottom="$5" textAlign="center">
              Edit Profile
            </Text>
            
            {/* Username Input */}
            <Text fontSize="$3" fontWeight="600" color={primaryText} marginBottom="$2">
              Username
            </Text>
            <View
              borderWidth={2}
              borderColor={border}
              borderRadius="$4"
              padding="$4"
              marginBottom="$4"
              backgroundColor={bg}
              focusStyle={{
                borderColor: accentColor
              }}
            >
              <TextInput
                value={editedUsername}
                onChangeText={setEditedUsername}
                placeholder="Enter username"
                style={{
                  fontSize: 16,
                  color: primaryText,
                  fontWeight: '500'
                }}
                placeholderTextColor={secondaryText}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            
            {/* Note about username editing */}
            <Text fontSize="$2" color={secondaryText} marginBottom="$5" textAlign="center" fontStyle="italic">
              Username editing will be fully functional in a future update
            </Text>
            
            {/* Action Buttons */}
            <RNView style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                onPress={handleCancelEdit}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: border,
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text color={primaryText} fontWeight="600" fontSize="$4">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSaveProfile}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: accentColor,
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  shadowColor: accentColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <Text color="white" fontWeight="600" fontSize="$4">Save</Text>
              </TouchableOpacity>
            </RNView>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileScreen; 