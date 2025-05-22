import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ExpensesListScreen: Lists all expenses/receipts, with filters and search.
const ExpensesListScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses List</Text>
      {/* Add expenses table/list and filters here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ExpensesListScreen; 