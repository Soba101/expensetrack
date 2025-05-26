import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import DashboardScreen from './screens/DashboardScreen';
import ExpensesListScreen from './screens/ExpensesListScreen';
import AddEditExpenseScreen from './screens/AddEditExpenseScreen';
import ExpenseDetailScreen from './screens/ExpenseDetailScreen';
import { Ionicons } from '@expo/vector-icons';
import { NativeBaseProvider, Icon, HStack, Pressable, Spinner, Box } from 'native-base';
import { colorModeManager } from './colorModeManager';
import CategoriesScreen from './screens/CategoriesScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen';
import InboxScreen from './screens/InboxScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { AuthProvider, useAuth } from './context/AuthContext';

// Suppress known NativeBase warnings that are harmless
// These warnings come from NativeBase's internal components and animations
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0] && 
    typeof args[0] === 'string' && 
    (args[0].includes('Sending `onAnimatedValueUpdate` with no listeners registered') ||
     args[0].includes('In React 18, SSRProvider is not necessary and is a noop'))
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
      options={({ navigation }) => ({
        title: 'Home',
        headerRight: () => (
          <HStack space={2}>
            <Pressable onPress={() => navigation.navigate('Inbox' as never)}>
              <Icon as={Ionicons} name="mail-outline" size="lg" color="gray.700" />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Settings' as never)}>
              <Icon as={Ionicons} name="settings-outline" size="lg" color="gray.700" />
            </Pressable>
          </HStack>
        ),
      })}
    />
    <Stack.Screen 
      name="Inbox" 
      component={InboxScreen} 
      options={{
        title: 'Inbox', 
      }}
    />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} options={{ title: 'Expense Detail' }} />
    <Stack.Screen name="ExpensesList" component={ExpensesListScreen} options={{ title: 'All Expenses' }} />
    <Stack.Screen name="AddEditExpense" component={AddEditExpenseScreen} options={{ title: 'Add/Edit Expense' }} />
    <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories' }} />
    <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
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
      {isAuthenticated ? <AuthenticatedStack /> : <UnauthenticatedStack />}
    </NavigationContainer>
  );
};
