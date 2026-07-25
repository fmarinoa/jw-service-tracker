import '../src/global.css';

import { Slot } from 'expo-router';
import { LogBox, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '../src/features/auth/AuthProvider';

if (Platform.OS === 'web') {
  LogBox.ignoreAllLogs();
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
