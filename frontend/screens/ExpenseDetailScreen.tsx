import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ExpenseDetailScreen: Shows details for a single expense/receipt.
const ExpenseDetailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Detail</Text>
      {/* Add detailed expense info here */}
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

export default ExpenseDetailScreen; 