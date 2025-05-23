import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import DashboardScreen from './screens/DashboardScreen';
import ExpensesListScreen from './screens/ExpensesListScreen';
import AddEditExpenseScreen from './screens/AddEditExpenseScreen';
import ExpenseDetailScreen from './screens/ExpenseDetailScreen';
import { Ionicons } from '@expo/vector-icons';
import { NativeBaseProvider, Icon, HStack, Pressable } from 'native-base';
import { colorModeManager } from './colorModeManager';
import CategoriesScreen from './screens/CategoriesScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen';
import InboxScreen from './screens/InboxScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NativeBaseProvider colorModeManager={colorModeManager}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={DashboardScreen}
            options={({ navigation }) => ({
              title: 'Home',
              headerRight: () => (
                <HStack space={2}>
                  <Pressable onPress={() => navigation.navigate('Inbox')}>
                    <Icon as={Ionicons} name="mail-outline" size="lg" color="gray.700" />
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate('Settings')}>
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
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
