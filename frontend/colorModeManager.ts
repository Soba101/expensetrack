import { ColorMode, StorageManager } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';

// This manager persists color mode in AsyncStorage (works for Expo/React Native)
export const colorModeManager: StorageManager = {
  get: async () => {
    try {
      let val = await AsyncStorage.getItem('@color-mode');
      return val === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  },
  set: async (value: ColorMode) => {
    try {
      await AsyncStorage.setItem('@color-mode', value);
    } catch (e) {
      // ignore write errors
    }
  },
}; 