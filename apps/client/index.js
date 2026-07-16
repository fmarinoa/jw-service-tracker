import { LogBox, Platform } from 'react-native';
import { StyleSheet } from 'react-native-css-interop';

// Set dark mode flag for NativeWind v4 / CSS Interop
if (typeof StyleSheet.setFlag === 'function') {
  StyleSheet.setFlag('darkMode', 'class');
} else if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--css-interop-darkMode', 'class');
}

if (Platform.OS === 'web') {
  // Catch the true, primary error before LogBox intercepts and crashes
  window.addEventListener('error', (event) => {
    console.log('🔴 CRITICAL UNCAUGHT ERROR:', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.log('🔴 CRITICAL UNHANDLED REJECTION:', event.reason);
  });

  // Disable LogBox on web to prevent the defective LogBoxStateSubscription overlay from crashing
  LogBox.ignoreAllLogs();
}

// Boot the standard Expo Router entry point
import 'expo-router/entry';
