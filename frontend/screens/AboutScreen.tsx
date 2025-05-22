import React from 'react';
import { View, Text } from 'react-native';

// AboutScreen: App info, version, support
// TODO: Replace placeholder with actual about and support info
const AboutScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>About</Text>
      <Text style={{ marginTop: 10 }}>This is a placeholder for the About screen.</Text>
    </View>
  );
};

export default AboutScreen; 