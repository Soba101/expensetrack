import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScrollView, 
  View as RNView, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput, 
  RefreshControl,
  Dimensions,
  Platform
} from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useToast } from '../components/Toast';
import * as expenseService from '../services/expenseService';

const { width } = Dimensions.get('window');

// CategoryManagementScreen: Modern category management with Apple-inspired design
// Features: Enhanced CRUD operations, search, filtering, budget tracking, and analytics
const CategoryManagementScreen: React.FC = () => {
  const [categories, setCategories] = useState<expenseService.Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<expenseService.Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<expenseService.Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'budget'>('name');
  const [formData, setFormData] = useState<expenseService.CategoryFormData>({
    name: '',
    icon: 'pricetag',
    color: '#007AFF',
    budget: undefined
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Filter and sort categories when search query or sort option changes
  useEffect(() => {
    let filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort categories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return (b.currentMonthTransactions || 0) - (a.currentMonthTransactions || 0);
        case 'budget':
          if (a.budget && b.budget) return b.budget - a.budget;
          if (a.budget) return -1;
          if (b.budget) return 1;
          return 0;
        default: // name
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredCategories(filtered);
  }, [categories, searchQuery, sortBy]);

  // Load categories with statistics
  const loadCategories = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Try to get existing categories first
      let categoriesData = await expenseService.getCategoriesWithStats();
      
      // If no categories exist, initialize default ones
      if (categoriesData.length === 0) {
        await expenseService.initializeDefaultCategories();
        categoriesData = await expenseService.getCategoriesWithStats();
      }
      
      setCategories(categoriesData);
      
      if (showRefreshIndicator) {
        // Haptic feedback for successful refresh
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toast.success('Categories Updated', 'Latest data loaded successfully');
      }
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      toast.error('Loading Failed', 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    loadCategories(true);
  }, []);

  // Validate form data
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.trim().length > 30) {
      errors.name = 'Category name must be less than 30 characters';
    }

    // Check for duplicate names (excluding current category when editing)
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === formData.name.trim().toLowerCase() &&
      cat._id !== editingCategory?._id
    );
    if (existingCategory) {
      errors.name = 'A category with this name already exists';
    }

    if (formData.budget !== undefined && formData.budget <= 0) {
      errors.budget = 'Budget must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (create or update)
  const handleSubmit = async () => {
    // Haptic feedback for form submission
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!validateForm()) {
      toast.error('Validation Error', 'Please fix the errors and try again');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        await expenseService.updateCategory(editingCategory._id, formData);
        toast.success('Category Updated', `${formData.name} has been updated successfully`);
      } else {
        // Create new category
        await expenseService.createCategory(formData);
        toast.success('Category Created', `${formData.name} has been created successfully`);
      }

      // Reload categories and close form
      await loadCategories();
      closeForm();
      
      // Success haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast.error('Save Failed', error.message || 'Failed to save category. Please try again.');
      
      // Error haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Handle category deletion
  const handleDelete = (category: expenseService.Category) => {
    // Haptic feedback for delete action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone and will affect all related expenses.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseService.deleteCategory(category._id);
              await loadCategories();
              
              toast.success('Category Deleted', `${category.name} has been deleted successfully`);
              
              // Success haptic feedback
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error: any) {
              console.error('Failed to delete category:', error);
              toast.error('Delete Failed', error.message || 'Failed to delete category. Please try again.');
              
              // Error haptic feedback
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          }
        }
      ]
    );
  };

  // Open form for editing
  const openEditForm = (category: expenseService.Category) => {
    // Haptic feedback for edit action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      budget: category.budget || undefined
    });
    setFormErrors({});
    setShowForm(true);
  };

  // Open form for creating new category
  const openCreateForm = () => {
    // Haptic feedback for create action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setEditingCategory(null);
    setFormData({
      name: '',
      icon: 'pricetag',
      color: '#007AFF',
      budget: undefined
    });
    setFormErrors({});
    setShowForm(true);
  };

  // Close form and reset state
  const closeForm = () => {
    // Haptic feedback for close action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: 'pricetag',
      color: '#007AFF',
      budget: undefined
    });
    setFormErrors({});
  };

  // Available icons for categories
  const availableIcons = [
    'restaurant', 'car', 'bag', 'game-controller', 'wifi', 'medical',
    'airplane', 'school', 'briefcase', 'cut', 'basket', 'home',
    'fitness', 'musical-notes', 'camera', 'gift', 'heart', 'star',
    'pricetag', 'ellipsis-horizontal', 'card', 'phone', 'laptop',
    'shirt', 'book', 'train', 'bicycle', 'cafe'
  ];

  // Available colors for categories
  const availableColors = [
    '#007AFF', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#00C7BE',
    '#8E8E93', '#5856D6', '#FF2D92', '#A2845E', '#6D6D6D', '#FFCC00',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
  ];

  // Render skeleton loading
  const renderSkeleton = () => (
    <View padding="$4" paddingTop={insets.top + 20}>
      {/* Header Skeleton */}
      <RNView style={{ marginBottom: 32 }}>
        <View
          height={40}
          width="60%"
          backgroundColor="#F2F2F7"
          borderRadius="$3"
          marginBottom="$3"
        />
        <View
          height={20}
          width="30%"
          backgroundColor="#F2F2F7"
          borderRadius="$2"
        />
      </RNView>

      {/* Search Bar Skeleton */}
      <View
        height={44}
        backgroundColor="#F2F2F7"
        borderRadius="$4"
        marginBottom="$4"
      />

      {/* Category Cards Skeleton */}
      {[1, 2, 3, 4].map((index) => (
        <View
          key={index}
          height={120}
          backgroundColor="#F2F2F7"
          borderRadius="$4"
          marginBottom="$3"
        />
      ))}
    </View>
  );

  // Render category card
  const renderCategoryCard = (category: expenseService.Category) => {
    const budgetProgress = category.budget && category.currentMonthSpent 
      ? (category.currentMonthSpent / category.budget) * 100 
      : 0;
    
    const isOverBudget = budgetProgress > 100;

    return (
      <TouchableOpacity
        key={category._id}
        onPress={() => openEditForm(category)}
        activeOpacity={0.7}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Category Icon */}
          <View
            width={56}
            height={56}
            backgroundColor={`${category.color}15`}
            borderRadius="$6"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons
              name={category.icon as keyof typeof Ionicons.glyphMap}
              size={28}
              color={category.color}
            />
          </View>

          {/* Category Info */}
          <RNView style={{ flex: 1, gap: 6 }}>
            <Text fontSize="$6" fontWeight="600" color="#1C1C1E">
              {category.name}
            </Text>
            <Text fontSize="$3" color="#8E8E93">
              {category.currentMonthTransactions || 0} transactions this month
            </Text>
            
            {/* Budget Progress */}
            {category.budget && (
              <RNView style={{ gap: 6, marginTop: 8 }}>
                <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text fontSize="$3" color="#8E8E93">
                    ${category.currentMonthSpent?.toFixed(2) || '0.00'} / ${category.budget.toFixed(2)}
                  </Text>
                  <Text 
                    fontSize="$3" 
                    color={isOverBudget ? '#FF3B30' : '#8E8E93'}
                    fontWeight={isOverBudget ? '600' : '400'}
                  >
                    {budgetProgress.toFixed(0)}%
                  </Text>
                </RNView>
                <View
                  height={6}
                  backgroundColor="#F2F2F7"
                  borderRadius="$2"
                  overflow="hidden"
                >
                  <View
                    height="100%"
                    width={`${Math.min(budgetProgress, 100)}%`}
                    backgroundColor={isOverBudget ? '#FF3B30' : category.color}
                    borderRadius="$2"
                  />
                </View>
              </RNView>
            )}
          </RNView>

          {/* Action Buttons */}
          <RNView style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                openEditForm(category);
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#007AFF15',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
            
            {!category.isDefault && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleDelete(category);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#FF3B3015',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="trash" size={16} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </RNView>
        </RNView>
      </TouchableOpacity>
    );
  };

  // Render search and filter bar
  const renderSearchAndFilter = () => (
    <RNView style={{ gap: 16 }}>
      {/* Search Bar */}
      <View
        flexDirection="row"
        alignItems="center"
        backgroundColor="#F2F2F7"
        borderRadius="$4"
        paddingHorizontal="$4"
        height={44}
      >
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 17,
            color: '#1C1C1E',
          }}
          placeholder="Search categories..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {[
          { key: 'name', label: 'Name', icon: 'text' },
          { key: 'usage', label: 'Usage', icon: 'trending-up' },
          { key: 'budget', label: 'Budget', icon: 'wallet' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => {
              setSortBy(option.key as any);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: sortBy === option.key ? '#007AFF' : '#F2F2F7',
            }}
          >
            <Ionicons
              name={option.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={sortBy === option.key ? '#FFFFFF' : '#8E8E93'}
            />
            <Text
              fontSize="$3"
              fontWeight="500"
              color={sortBy === option.key ? '#FFFFFF' : '#8E8E93'}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </RNView>
  );

  // Render category form modal
  const renderCategoryForm = () => (
    <Modal
      visible={showForm}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View flex={1} backgroundColor="#F2F2F7">
        <ScrollView style={{ flex: 1 }}>
          <View padding="$4" paddingTop={insets.top + 20}>
            {/* Header */}
            <RNView style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 32
            }}>
              <RNView>
                <Text fontSize="$8" fontWeight="bold" color="#1C1C1E">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </Text>
                <Text fontSize="$4" color="#8E8E93">
                  {editingCategory ? 'Update category details' : 'Create a new expense category'}
                </Text>
              </RNView>
              <TouchableOpacity
                onPress={closeForm}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#8E8E9320',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </RNView>

            {/* Category Name */}
            <RNView style={{ marginBottom: 24 }}>
              <Text fontSize="$4" fontWeight="600" color="#1C1C1E" marginBottom="$3">
                Category Name
              </Text>
              <View
                backgroundColor="#FFFFFF"
                borderRadius="$4"
                borderWidth={formErrors.name ? 2 : 1}
                borderColor={formErrors.name ? '#FF3B30' : '#E5E5EA'}
                paddingHorizontal="$4"
                height={44}
                justifyContent="center"
              >
                <TextInput
                  style={{
                    fontSize: 17,
                    color: '#1C1C1E',
                  }}
                  placeholder="Enter category name"
                  placeholderTextColor="#8E8E93"
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  maxLength={30}
                  returnKeyType="done"
                />
              </View>
              {formErrors.name && (
                <Text fontSize="$3" color="#FF3B30" marginTop="$2">
                  {formErrors.name}
                </Text>
              )}
            </RNView>

            {/* Icon Selection */}
            <RNView style={{ marginBottom: 24 }}>
              <Text fontSize="$4" fontWeight="600" color="#1C1C1E" marginBottom="$3">
                Icon
              </Text>
              <RNView style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: 12,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                padding: 16,
              }}>
                {availableIcons.map((iconName) => (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => {
                      setFormData({ ...formData, icon: iconName });
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: formData.icon === iconName ? `${formData.color}15` : '#F2F2F7',
                      borderWidth: 2,
                      borderColor: formData.icon === iconName ? formData.color : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={iconName as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={formData.icon === iconName ? formData.color : '#8E8E93'}
                    />
                  </TouchableOpacity>
                ))}
              </RNView>
            </RNView>

            {/* Color Selection */}
            <RNView style={{ marginBottom: 24 }}>
              <Text fontSize="$4" fontWeight="600" color="#1C1C1E" marginBottom="$3">
                Color
              </Text>
              <RNView style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: 12,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                padding: 16,
              }}>
                {availableColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      setFormData({ ...formData, color });
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: color,
                      borderWidth: 4,
                      borderColor: formData.color === color ? '#1C1C1E' : '#FFFFFF',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                ))}
              </RNView>
            </RNView>

            {/* Budget Setting */}
            <RNView style={{ marginBottom: 32 }}>
              <Text fontSize="$4" fontWeight="600" color="#1C1C1E" marginBottom="$3">
                Monthly Budget (Optional)
              </Text>
              <View
                backgroundColor="#FFFFFF"
                borderRadius="$4"
                borderWidth={formErrors.budget ? 2 : 1}
                borderColor={formErrors.budget ? '#FF3B30' : '#E5E5EA'}
                paddingHorizontal="$4"
                height={44}
                justifyContent="center"
              >
                <TextInput
                  style={{
                    fontSize: 17,
                    color: '#1C1C1E',
                  }}
                  placeholder="Enter monthly budget amount"
                  placeholderTextColor="#8E8E93"
                  value={formData.budget?.toString() || ''}
                  onChangeText={(text) => {
                    const amount = parseFloat(text) || undefined;
                    setFormData({ ...formData, budget: amount });
                    if (formErrors.budget) {
                      setFormErrors({ ...formErrors, budget: '' });
                    }
                  }}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
              {formErrors.budget && (
                <Text fontSize="$3" color="#FF3B30" marginTop="$2">
                  {formErrors.budget}
                </Text>
              )}
              <Text fontSize="$3" color="#8E8E93" marginTop="$2">
                Set a monthly spending limit for this category
              </Text>
            </RNView>

            {/* Action Buttons */}
            <RNView style={{ gap: 12, paddingBottom: 32 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!formData.name.trim()}
                style={{
                  backgroundColor: formData.name.trim() ? formData.color : '#8E8E93',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  shadowColor: formData.name.trim() ? formData.color : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text color="white" fontSize="$5" fontWeight="600">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={closeForm}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#E5E5EA',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text color="#8E8E93" fontSize="$5" fontWeight="600">
                  Cancel
                </Text>
              </TouchableOpacity>
            </RNView>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View
      padding="$6"
      borderRadius="$6"
      backgroundColor="#FFFFFF"
      alignItems="center"
      justifyContent="center"
      minHeight={300}
      marginTop="$6"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
    >
      <View
        width={80}
        height={80}
        backgroundColor="#F2F2F7"
        borderRadius="$6"
        alignItems="center"
        justifyContent="center"
        marginBottom="$4"
      >
        <Ionicons name="pricetag-outline" size={40} color="#8E8E93" />
      </View>
      <Text fontSize="$6" fontWeight="600" color="#1C1C1E" marginBottom="$2">
        {searchQuery ? 'No Categories Found' : 'No Categories Yet'}
      </Text>
      <Text fontSize="$4" color="#8E8E93" textAlign="center" marginBottom="$4">
        {searchQuery 
          ? `No categories match "${searchQuery}". Try a different search term.`
          : 'Create your first category to start organizing your expenses.'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          onPress={openCreateForm}
          style={{
            backgroundColor: '#007AFF',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text color="white" fontSize="$4" fontWeight="600">
            Create Category
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return renderSkeleton();
  }

  return (
    <View flex={1} backgroundColor="#F2F2F7">
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
      >
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

          {/* Title and Add Button Row */}
          <RNView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <RNView style={{ flex: 1 }}>
              <Text fontSize={34} fontWeight="bold" color="#000000" marginBottom={4}>
                Categories
              </Text>
              <Text fontSize={17} color="#8E8E93" fontWeight="400">
                {filteredCategories.length} of {categories.length} categories
                {searchQuery ? ' (filtered)' : ''}
              </Text>
            </RNView>
            
            {/* Add Category Button */}
            <TouchableOpacity
              onPress={openCreateForm}
              style={{
                backgroundColor: '#007AFF',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text color="white" fontWeight="600">Add</Text>
            </TouchableOpacity>
          </RNView>
        </View>

        {/* Search and Filter */}
        {categories.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            {renderSearchAndFilter()}
          </View>
        )}

        {/* Categories List */}
        <View style={{ paddingHorizontal: 20 }}>
          {filteredCategories.length > 0 ? (
            <RNView style={{ gap: 0 }}>
              {filteredCategories.map(renderCategoryCard)}
            </RNView>
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      {/* Category Form Modal */}
      {renderCategoryForm()}
    </View>
  );
};

export default CategoryManagementScreen; 