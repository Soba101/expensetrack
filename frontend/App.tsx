import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { BackHandler } from 'react-native';
import DashboardScreen from './screens/DashboardScreen';
import ExpensesListScreen from './screens/ExpensesListScreen';
import AddEditExpenseScreen from './screens/AddEditExpenseScreen';
import ExpenseDetailScreen from './screens/ExpenseDetailScreen';
import { Ionicons } from '@expo/vector-icons';
// Tamagui imports replacing Native Base
import { TamaguiProvider, View, Text } from '@tamagui/core';
import tamaguiConfig from './tamagui.config';
import CategoriesScreen from './screens/CategoriesScreen';
import CategoryManagementScreen from './screens/CategoryManagementScreen';
import ReportsScreen from './screens/ReportsScreen';
import AboutScreen from './screens/AboutScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseDataProvider } from './context/ExpenseDataContext';
import { ToastProvider } from './components/Toast';

// Fix for BackHandler.removeEventListener deprecation in React Native 0.60+
// This polyfill ensures compatibility with older navigation libraries
if (!(BackHandler as any).removeEventListener) {
  (BackHandler as any).removeEventListener = (eventType: string, handler: () => boolean) => {
    // In newer versions, BackHandler uses subscription pattern
    // This is a no-op fallback for compatibility
    console.warn('BackHandler.removeEventListener is deprecated. Using compatibility mode.');
    return false;
  };
}

// Suppress known warnings that are harmless during migration
// These warnings come from the transition period between Native Base and Tamagui
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0] && 
    typeof args[0] === 'string' && 
    (args[0].includes('Sending `onAnimatedValueUpdate` with no listeners registered') ||
     args[0].includes('In React 18, SSRProvider is not necessary and is a noop') ||
     args[0].includes('BackHandler.removeEventListener is deprecated'))
  ) {
    return; // Suppress these specific warnings
  }
  originalWarn(...args);
};

const Stack = createNativeStackNavigator();

const AuthenticatedStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={DashboardScreen}
      options={{
        headerShown: false,
      }}
    />

    <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} options={{ title: 'Expense Detail' }} />
    <Stack.Screen name="ExpensesList" component={ExpensesListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddEditExpense" component={AddEditExpenseScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Categories" component={CategoryManagementScreen} options={{ title: 'Manage Categories' }} />
    <Stack.Screen name="CategoriesView" component={CategoriesScreen} options={{ title: 'Categories Overview' }} />
    <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
  </Stack.Navigator>
);

const UnauthenticatedStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <ToastProvider>
        <AuthProvider>
          <ExpenseDataProvider>
            <AppContent />
          </ExpenseDataProvider>
        </AuthProvider>
      </ToastProvider>
    </TamaguiProvider>
  );
}

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {isAuthenticated ? (
        <AuthenticatedStack />
      ) : (
        <UnauthenticatedStack />
      )}
    </NavigationContainer>
  );
};
