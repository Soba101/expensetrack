import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// AdminScreen: For admin users to manage users and view all expenses.
const AdminScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin</Text>
      {/* Add admin controls and user management here */}
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

export default AdminScreen; 