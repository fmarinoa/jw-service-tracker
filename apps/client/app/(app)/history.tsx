import { formatMonthYearHeader } from '@jw-tracker/shared';
import { DateTime } from 'luxon';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RecentActivityCard from '../../src/features/dashboard/components/RecentActivityCard';
import { useDashboard } from '../../src/features/dashboard/DashboardProvider';
import { useFloatingTabBarClearance } from '../../src/features/dashboard/useFloatingTabBarOffset';

export default function HistoryScreen() {
  const {
    user,
    isLoading,
    monthOffset,
    handleMonthChange,
    resetForm,
    setShowAddModal,
  } = useDashboard();
  const tabBarClearance = useFloatingTabBarClearance();
  const insets = useSafeAreaInsets();

  if (isLoading || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#b86a3d" />
      </View>
    );
  }

  const monthLabel = formatMonthYearHeader(
    DateTime.now().setZone('America/Lima').plus({ months: monthOffset }),
  );
  const canPrevMonth = monthOffset > -2;
  const canNextMonth = monthOffset < 0;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: tabBarClearance + 24,
        }}
      >
        <View className="px-5 pt-5 gap-4">
          {/* HEADER */}
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground font-extrabold text-[22px]">
              Historial
            </Text>
            <Pressable
              onPress={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="w-[38px] h-[38px] rounded-xl bg-primary items-center justify-center active:bg-primary/90"
            >
              <Text className="text-primary-foreground font-bold text-lg">
                +
              </Text>
            </Pressable>
          </View>

          {/* MONTH SWITCHER */}
          <View className="flex-row justify-between items-center bg-card border border-border px-3 py-2.5 rounded-2xl">
            <Pressable
              onPress={() => handleMonthChange(monthOffset - 1)}
              disabled={!canPrevMonth}
              className={`px-3 py-1.5 bg-muted rounded-lg active:bg-muted/80 ${
                !canPrevMonth ? 'opacity-40' : ''
              }`}
            >
              <Text className="text-foreground text-xs font-bold">◀</Text>
            </Pressable>
            <Text className="text-foreground font-bold text-sm">
              {monthLabel}
            </Text>
            <Pressable
              onPress={() => handleMonthChange(monthOffset + 1)}
              disabled={!canNextMonth}
              className={`px-3 py-1.5 bg-muted rounded-lg active:bg-muted/80 ${
                !canNextMonth ? 'opacity-40' : ''
              }`}
            >
              <Text className="text-foreground text-xs font-bold">▶</Text>
            </Pressable>
          </View>

          <RecentActivityCard title="Registros" />
        </View>
      </ScrollView>
    </View>
  );
}
