import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import DashboardScreen from './screens/DashboardScreen';
import ExpensesListScreen from './screens/ExpensesListScreen';
import AddEditExpenseScreen from './screens/AddEditExpenseScreen';
import ExpenseDetailScreen from './screens/ExpenseDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminScreen from './screens/AdminScreen';
import { Ionicons } from '@expo/vector-icons';
import { NativeBaseProvider } from 'native-base';
import { colorModeManager } from './colorModeManager';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main tabs: Dashboard, Expenses, Add, Profile
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Expenses') iconName = 'list';
          else if (route.name === 'Add') iconName = 'add-circle';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Expenses" component={ExpensesListScreen} />
      <Tab.Screen name="Add" component={AddEditExpenseScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root stack: Tabs + screens not in tabs (Expense Detail, Admin)
export default function App() {
  return (
    <NativeBaseProvider colorModeManager={colorModeManager}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} options={{ title: 'Expense Detail' }} />
          <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
