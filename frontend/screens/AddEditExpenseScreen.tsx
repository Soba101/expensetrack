import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// AddEditExpenseScreen: Form to add or edit an expense, including receipt upload.
const AddEditExpenseScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add / Edit Expense</Text>
      {/* Add expense form and receipt upload here */}
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

export default AddEditExpenseScreen; 