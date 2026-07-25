import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../src/features/auth/useAuth';
import ConfirmDeleteDialog from '../../src/features/dashboard/components/ConfirmDeleteDialog';
import EntryDialog from '../../src/features/dashboard/components/EntryDialog';
import {
  AccountIcon,
  HistoryIcon,
  HomeIcon,
} from '../../src/features/dashboard/components/icons';
import { DashboardProvider } from '../../src/features/dashboard/DashboardProvider';
import {
  getFloatingTabBarBottomOffset,
  getFloatingTabBarHeight,
} from '../../src/features/dashboard/useFloatingTabBarOffset';
import { AppUpdateNotification } from '../../src/features/updates/AppUpdateNotification';

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

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
      <AppUpdateNotification />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#b86a3d',
          tabBarInactiveTintColor: '#7b726c',
          tabBarStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: getFloatingTabBarBottomOffset(insets.bottom),
            marginHorizontal: 16,
            backgroundColor: '#fffdfa',
            borderTopColor: 'transparent',
            borderTopWidth: 0,
            height: getFloatingTabBarHeight(),
            borderRadius: 24,
            paddingTop: 6,
            paddingBottom: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 12,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            lineHeight: 16,
          },
          tabBarItemStyle: {
            paddingVertical: 0,
          },
        }}
      >
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen
          name="home"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <HomeIcon color={color as string} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Historial',
            tabBarIcon: ({ color }) => <HistoryIcon color={color as string} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <AccountIcon color={color as string} />,
          }}
        />
      </Tabs>
      <EntryDialog />
      <ConfirmDeleteDialog />
    </DashboardProvider>
  );
}
