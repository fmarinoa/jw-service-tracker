import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../../src/features/auth/useAuth';
import { DashboardProvider } from '../../src/features/dashboard/DashboardProvider';

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#b86a3d" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <DashboardProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DashboardProvider>
  );
}
