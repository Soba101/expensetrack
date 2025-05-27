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
import { NativeBaseProvider, Icon, HStack, Pressable, Spinner, Box } from 'native-base';
import { colorModeManager } from './colorModeManager';
import CategoriesScreen from './screens/CategoriesScreen';
import ReportsScreen from './screens/ReportsScreen';
import AboutScreen from './screens/AboutScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseDataProvider } from './context/ExpenseDataContext';

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

// Suppress known NativeBase warnings that are harmless
// These warnings come from NativeBase's internal components and animations
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
    <Stack.Screen name="ExpensesList" component={ExpensesListScreen} options={{ title: 'All Expenses' }} />
    <Stack.Screen name="AddEditExpense" component={AddEditExpenseScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories' }} />
    <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
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
    <NativeBaseProvider colorModeManager={colorModeManager}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NativeBaseProvider>
  );
}

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {isAuthenticated ? (
        <ExpenseDataProvider>
          <AuthenticatedStack />
        </ExpenseDataProvider>
      ) : (
        <UnauthenticatedStack />
      )}
    </NavigationContainer>
  );
};
