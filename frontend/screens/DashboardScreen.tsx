import React from 'react';
import { ScrollView, useColorModeValue } from 'native-base';
import ExpenseSummary from '../components/ExpenseSummary';
import RecentTransactions from '../components/RecentTransactions';
import ExpenseBreakdown from '../components/ExpenseBreakdown';
import QuickActions from '../components/QuickActions';
import UserInfo from '../components/UserInfo';

// DashboardScreen: Shows an overview of expenses and quick stats using modular components
const DashboardScreen: React.FC = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  return (
    // Apple-style: Add extra top padding for visual comfort
    <ScrollView flex={1} bg={bg} p={4} pt={8}>
      {/* User info at the top */}
      <UserInfo />
      {/* Quick actions for adding expenses or uploading receipts */}
      <QuickActions />
      {/* Expense summary section */}
      <ExpenseSummary />
      {/* Expense breakdown by category */}
      <ExpenseBreakdown />
      {/* Recent transactions list */}
      <RecentTransactions />
    </ScrollView>
  );
};

export default DashboardScreen; 