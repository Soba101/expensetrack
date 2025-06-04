import React, { useState, useEffect } from 'react';
import { ScrollView, View as RNView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { View, Text, useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as expenseService from '../services/expenseService';

// CategoryManagementScreen: Comprehensive category management with CRUD operations
// Features: Create/edit/delete categories, set budgets, custom icons and colors
const CategoryManagementScreen: React.FC = () => {
  const [categories, setCategories] = useState<expenseService.Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<expenseService.Category | null>(null);
  const [formData, setFormData] = useState<expenseService.CategoryFormData>({
    name: '',
    icon: 'pricetag',
    color: '#3B82F6',
    budget: undefined
  });

  const navigation = useNavigation();
  const theme = useTheme();

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories with statistics
  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Try to get existing categories first
      let categoriesData = await expenseService.getCategoriesWithStats();
      
      // If no categories exist, initialize default ones
      if (categoriesData.length === 0) {
        await expenseService.initializeDefaultCategories();
        categoriesData = await expenseService.getCategoriesWithStats();
      }
      
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Category name is required');
        return;
      }

      if (editingCategory) {
        // Update existing category
        await expenseService.updateCategory(editingCategory._id, formData);
      } else {
        // Create new category
        await expenseService.createCategory(formData);
      }

      // Reload categories and close form
      await loadCategories();
      closeForm();
      
      Alert.alert(
        'Success', 
        editingCategory ? 'Category updated successfully' : 'Category created successfully'
      );
    } catch (error: any) {
      console.error('Failed to save category:', error);
      Alert.alert('Error', error.message || 'Failed to save category');
    }
  };

  // Handle category deletion
  const handleDelete = (category: expenseService.Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseService.deleteCategory(category._id);
              await loadCategories();
              Alert.alert('Success', 'Category deleted successfully');
            } catch (error: any) {
              console.error('Failed to delete category:', error);
              Alert.alert('Error', error.message || 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  // Open form for editing
  const openEditForm = (category: expenseService.Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      budget: category.budget || undefined
    });
    setShowForm(true);
  };

  // Open form for creating new category
  const openCreateForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: 'pricetag',
      color: '#3B82F6',
      budget: undefined
    });
    setShowForm(true);
  };

  // Close form and reset state
  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: 'pricetag',
      color: '#3B82F6',
      budget: undefined
    });
  };

  // Available icons for categories
  const availableIcons = [
    'restaurant', 'car', 'bag', 'game-controller', 'wifi', 'medical',
    'airplane', 'school', 'briefcase', 'cut', 'basket', 'home',
    'fitness', 'musical-notes', 'camera', 'gift', 'heart', 'star',
    'pricetag', 'ellipsis-horizontal'
  ];

  // Available colors for categories
  const availableColors = [
    '#3B82F6', '#059669', '#DC2626', '#EA580C', '#7C3AED', '#0891B2',
    '#7C2D12', '#1D4ED8', '#374151', '#BE185D', '#6B7280', '#F59E0B', 
    '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  // Render category card
  const renderCategoryCard = (category: expenseService.Category) => {
    const budgetProgress = category.budget && category.currentMonthSpent 
      ? (category.currentMonthSpent / category.budget) * 100 
      : 0;
    
    const isOverBudget = budgetProgress > 100;

    return (
      <View
        key={category._id}
        padding="$4"
        borderRadius="$6"
        backgroundColor={theme.backgroundHover.val}
        borderWidth={1}
        borderColor={theme.borderColor.val}
        marginBottom="$3"
      >
        <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Category Icon */}
          <View
            padding="$3"
            backgroundColor={`${category.color}20`}
            borderRadius="$6"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons
              name={category.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={category.color}
            />
          </View>

          {/* Category Info */}
          <RNView style={{ flex: 1, gap: 4 }}>
            <Text fontSize="$5" fontWeight="600" color={theme.color.val}>
              {category.name}
            </Text>
            <Text fontSize="$3" color={theme.colorHover.val}>
              {category.currentMonthTransactions || 0} transactions this month
            </Text>
            
            {/* Budget Progress */}
            {category.budget && (
              <RNView style={{ gap: 4, marginTop: 8 }}>
                <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text fontSize="$2" color={theme.colorHover.val}>
                    ${category.currentMonthSpent?.toFixed(2) || '0.00'} / ${category.budget.toFixed(2)}
                  </Text>
                  <Text 
                    fontSize="$2" 
                    color={isOverBudget ? '#DC2626' : theme.colorHover.val}
                    fontWeight={isOverBudget ? '600' : '400'}
                  >
                    {budgetProgress.toFixed(0)}%
                  </Text>
                </RNView>
                <View
                  height={6}
                  backgroundColor="#F3F4F6"
                  borderRadius="$2"
                  overflow="hidden"
                >
                  <View
                    height="100%"
                    width={`${Math.min(budgetProgress, 100)}%`}
                    backgroundColor={isOverBudget ? '#DC2626' : category.color}
                  />
                </View>
              </RNView>
            )}
          </RNView>

          {/* Action Buttons */}
          <RNView style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => openEditForm(category)}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: '#EBF8FF',
              }}
            >
              <Ionicons name="pencil" size={16} color="#3B82F6" />
            </TouchableOpacity>
            
            {!category.isDefault && (
              <TouchableOpacity
                onPress={() => handleDelete(category)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: '#FEE2E2',
                }}
              >
                <Ionicons name="trash" size={16} color="#DC2626" />
              </TouchableOpacity>
            )}
          </RNView>
        </RNView>
      </View>
    );
  };

  // Render category form modal
  const renderCategoryForm = () => (
    <Modal
      visible={showForm}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View flex={1} backgroundColor={theme.background.val}>
        <ScrollView style={{ flex: 1 }}>
          <View padding="$4" paddingTop="$6">
            {/* Header */}
            <RNView style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 24
            }}>
              <Text fontSize="$7" fontWeight="bold" color={theme.color.val}>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </Text>
              <TouchableOpacity onPress={closeForm}>
                <Ionicons name="close" size={24} color={theme.colorHover.val} />
              </TouchableOpacity>
            </RNView>

            {/* Category Name */}
            <RNView style={{ gap: 8, marginBottom: 24 }}>
              <Text fontSize="$4" fontWeight="600" color={theme.color.val}>
                Category Name
              </Text>
              <View
                padding="$3"
                borderRadius="$4"
                backgroundColor={theme.backgroundHover.val}
                borderWidth={1}
                borderColor={theme.borderColor.val}
              >
                <Text
                  fontSize="$4"
                  color={theme.color.val}
                  onPress={() => {
                    // In a real app, you'd use a TextInput here
                    Alert.prompt(
                      'Category Name',
                      'Enter category name:',
                      (text) => setFormData({ ...formData, name: text || '' }),
                      'plain-text',
                      formData.name
                    );
                  }}
                >
                  {formData.name || 'Tap to enter name'}
                </Text>
              </View>
            </RNView>

            {/* Icon Selection */}
            <RNView style={{ gap: 8, marginBottom: 24 }}>
              <Text fontSize="$4" fontWeight="600" color={theme.color.val}>
                Icon
              </Text>
              <RNView style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: 12 
              }}>
                {availableIcons.map((iconName) => (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => setFormData({ ...formData, icon: iconName })}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: formData.icon === iconName ? formData.color + '20' : theme.backgroundHover.val,
                      borderWidth: 1,
                      borderColor: formData.icon === iconName ? formData.color : theme.borderColor.val,
                    }}
                  >
                    <Ionicons
                      name={iconName as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={formData.icon === iconName ? formData.color : theme.colorHover.val}
                    />
                  </TouchableOpacity>
                ))}
              </RNView>
            </RNView>

            {/* Color Selection */}
            <RNView style={{ gap: 8, marginBottom: 24 }}>
              <Text fontSize="$4" fontWeight="600" color={theme.color.val}>
                Color
              </Text>
              <RNView style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: 12 
              }}>
                {availableColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setFormData({ ...formData, color })}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: color,
                      borderWidth: 3,
                      borderColor: formData.color === color ? '#000' : 'transparent',
                    }}
                  />
                ))}
              </RNView>
            </RNView>

            {/* Budget Setting */}
            <RNView style={{ gap: 8, marginBottom: 32 }}>
              <Text fontSize="$4" fontWeight="600" color={theme.color.val}>
                Monthly Budget (Optional)
              </Text>
              <View
                padding="$3"
                borderRadius="$4"
                backgroundColor={theme.backgroundHover.val}
                borderWidth={1}
                borderColor={theme.borderColor.val}
              >
                <Text
                  fontSize="$4"
                  color={theme.color.val}
                  onPress={() => {
                    Alert.prompt(
                      'Monthly Budget',
                      'Enter monthly budget amount:',
                      (text) => {
                        const amount = parseFloat(text || '0');
                        setFormData({ 
                          ...formData, 
                          budget: isNaN(amount) ? undefined : amount 
                        });
                      },
                      'plain-text',
                      formData.budget?.toString() || ''
                    );
                  }}
                >
                  {formData.budget ? `$${formData.budget.toFixed(2)}` : 'Tap to set budget'}
                </Text>
              </View>
            </RNView>

            {/* Action Buttons */}
            <RNView style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!formData.name.trim()}
                style={{
                  backgroundColor: formData.name.trim() ? formData.color : '#9CA3AF',
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text color="white" fontSize="$4" fontWeight="600">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={closeForm}
                style={{
                  borderWidth: 1,
                  borderColor: theme.borderColor.val,
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text color={theme.colorHover.val} fontSize="$4" fontWeight="600">
                  Cancel
                </Text>
              </TouchableOpacity>
            </RNView>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View flex={1} backgroundColor={theme.background.val} alignItems="center" justifyContent="center">
        <Text color={theme.colorHover.val}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor={theme.background.val}>
      <ScrollView style={{ flex: 1 }}>
        <View padding="$4" paddingTop="$6">
          {/* Header */}
          <RNView style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 24
          }}>
            <RNView>
              <Text fontSize="$8" fontWeight="bold" color={theme.color.val}>
                Manage Categories
              </Text>
              <Text fontSize="$4" color={theme.colorHover.val}>
                {categories.length} categories
              </Text>
            </RNView>
            
            <TouchableOpacity
              onPress={openCreateForm}
              style={{
                backgroundColor: '#3B82F6',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text color="white" fontWeight="600">Add</Text>
            </TouchableOpacity>
          </RNView>

          {/* Categories List */}
          <RNView style={{ gap: 12 }}>
            {categories.map(renderCategoryCard)}
          </RNView>

          {/* Empty State */}
          {categories.length === 0 && (
            <View
              padding="$6"
              borderRadius="$6"
              backgroundColor={theme.backgroundHover.val}
              borderWidth={1}
              borderColor={theme.borderColor.val}
              alignItems="center"
              justifyContent="center"
              minHeight={200}
            >
              <Ionicons name="pricetag-outline" size={48} color={theme.colorHover.val} />
              <Text fontSize="$5" fontWeight="600" color={theme.color.val} marginTop="$4">
                No Categories Yet
              </Text>
              <Text fontSize="$3" color={theme.colorHover.val} textAlign="center" marginTop="$2">
                Create your first category to start organizing your expenses.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Category Form Modal */}
      {renderCategoryForm()}
    </View>
  );
};

export default CategoryManagementScreen; 