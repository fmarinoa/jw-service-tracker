import {
  formatMonthYearHeader,
  PREACHER_TYPE_LABELS,
  SessionType,
} from '@jw-tracker/shared';
import { useRouter } from 'expo-router';
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

import { CategoryIcon } from '../../src/features/dashboard/components/icons';
import ProgressCircle from '../../src/features/dashboard/components/ProgressCircle';
import { useDashboard } from '../../src/features/dashboard/DashboardProvider';
import { useFloatingTabBarClearance } from '../../src/features/dashboard/useFloatingTabBarOffset';

const TYPE_LABELS: Record<SessionType, string> = {
  house_to_house: 'Casa en casa',
  revisits: 'Revisitas',
  bible_study: 'Estudio Bíblico',
  other: 'Otro',
};

export default function HomeScreen() {
  const router = useRouter();
  const {
    user,
    isLoading,
    entries,
    reportedHours,
    progressPercentage,
    hoursLeft,
    stats,
    monthOffset,
    resetForm,
    setShowAddModal,
    showExportOptions,
    setShowExportOptions,
    exportingMonthOffset,
    showExportSuccess,
    handleExportReport,
    handleEdit,
    openDeleteModal,
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
  const isGoalCompleted =
    user.monthlyGoal > 0 && reportedHours >= user.monthlyGoal;
  const userInitial = (user.name || user.phone).charAt(0).toUpperCase();
  const recentPreview = entries.slice(0, 3);

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
          <View className="flex-row items-center gap-3 mb-1">
            <View className="w-[46px] h-[46px] rounded-2xl bg-primary/10 items-center justify-center">
              <Text className="text-primary font-extrabold text-lg">
                {userInitial}
              </Text>
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-foreground font-extrabold text-lg">
                {user.name || user.phone}
              </Text>
              <Text className="text-muted-foreground text-xs font-semibold mt-0.5">
                {PREACHER_TYPE_LABELS[user.preacherType || 'publisher']}
                {user.monthlyGoal > 0
                  ? ` • Meta: ${user.monthlyGoal} horas`
                  : ''}
              </Text>
            </View>
          </View>

          {/* HERO CARD */}
          <View className="bg-card border border-border rounded-3xl px-5 pt-7 pb-6 items-center">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {monthLabel} · Horas de este mes
            </Text>

            <ProgressCircle
              progressPercentage={progressPercentage}
              reportedHours={reportedHours}
              monthlyGoal={user.monthlyGoal}
            />

            <View className="flex-row gap-2.5 w-full mb-4">
              <View className="flex-1 bg-background border border-border rounded-2xl py-3 items-center">
                <Text className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Meta
                </Text>
                <Text className="text-foreground font-extrabold text-lg mt-0.5">
                  {user.monthlyGoal > 0 ? `${user.monthlyGoal}h` : '—'}
                </Text>
              </View>
              <View className="flex-1 bg-background border border-border rounded-2xl py-3 items-center">
                <Text className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Restante
                </Text>
                <Text className="text-foreground font-extrabold text-lg mt-0.5">
                  {hoursLeft}h
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="w-full py-4 bg-primary rounded-2xl flex-row items-center justify-center gap-2 active:bg-primary/90"
            >
              <Text className="text-primary-foreground font-bold text-[15.5px]">
                + Registrar horas
              </Text>
            </Pressable>

            {isGoalCompleted && (
              <View className="flex-row items-center gap-1.5 mt-3.5">
                <Text className="text-[15px]">✓</Text>
                <Text
                  className="text-[12.5px] font-bold"
                  style={{ color: '#5c7a52' }}
                >
                  ¡Felicidades por alcanzar tu meta!
                </Text>
              </View>
            )}
          </View>

          {/* CATEGORIES */}
          <View className="bg-card border border-border rounded-2xl p-5">
            <Text className="text-foreground font-extrabold text-[15px] mb-3.5">
              Por categoría
            </Text>
            {(Object.keys(TYPE_LABELS) as SessionType[]).map(
              (type, idx, arr) => (
                <View
                  key={type}
                  className={`flex-row justify-between items-center py-2.5 ${
                    idx < arr.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <View className="flex-row items-center gap-2.5">
                    <CategoryIcon type={type} />
                    <Text className="text-foreground font-semibold text-[13.5px]">
                      {TYPE_LABELS[type]}
                    </Text>
                  </View>
                  <Text className="text-foreground font-extrabold text-sm">
                    {Math.floor((stats.byType[type] || 0) / 60)}h
                  </Text>
                </View>
              ),
            )}

            {showExportSuccess ? (
              <View className="w-full mt-4 h-10 justify-center items-center bg-green-50 border border-green-200 rounded-xl">
                <Text className="text-sm font-bold text-green-700">
                  ¡Copiado al portapapeles!
                </Text>
              </View>
            ) : showExportOptions ? (
              <View className="mt-4 pt-3.5 border-t border-border gap-1.5">
                <Text className="text-xs text-muted-foreground font-semibold mb-1">
                  Selecciona el mes para exportar:
                </Text>
                {[0, -1, -2].map((offset) => {
                  const targetDate = DateTime.now()
                    .setZone('America/Lima')
                    .plus({ months: offset });
                  return (
                    <Pressable
                      key={offset}
                      onPress={() => {
                        handleExportReport(offset);
                        setShowExportOptions(false);
                      }}
                      disabled={exportingMonthOffset !== null}
                      className="w-full py-2.5 bg-background border border-border rounded-xl items-center active:bg-muted"
                    >
                      <Text className="text-xs font-semibold text-foreground">
                        {exportingMonthOffset === offset
                          ? 'Copiando...'
                          : formatMonthYearHeader(targetDate)}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => setShowExportOptions(false)}
                  className="w-full py-1.5 items-center mt-1"
                >
                  <Text className="text-xs font-semibold text-muted-foreground">
                    Cancelar
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowExportOptions(true)}
                className="w-full mt-4 py-3 bg-background border border-border rounded-xl flex-row items-center justify-center gap-2 active:bg-muted"
              >
                <Text className="text-foreground font-bold text-[13.5px]">
                  ⬆ Exportar reporte
                </Text>
              </Pressable>
            )}
          </View>

          {/* RECENT ACTIVITY PREVIEW */}
          <View className="bg-card border border-border rounded-2xl p-5">
            <View className="flex-row justify-between items-center mb-3.5">
              <Text className="text-foreground font-extrabold text-[15px]">
                Actividad reciente
              </Text>
              <Pressable
                onPress={() => router.push('/history')}
                className="flex-row items-center gap-1"
              >
                <Text className="text-primary font-bold text-xs">
                  Ver todo →
                </Text>
              </Pressable>
            </View>

            {recentPreview.length === 0 ? (
              <View className="py-6 items-center">
                <Text className="text-muted-foreground font-semibold text-[13px]">
                  No hay registros para este mes
                </Text>
              </View>
            ) : (
              recentPreview.map((entry, idx) => (
                <View
                  key={entry.id}
                  className={`flex-row justify-between items-center py-2.5 gap-3 ${
                    idx < recentPreview.length - 1
                      ? 'border-b border-border'
                      : ''
                  }`}
                >
                  <View className="flex-1 min-w-0">
                    <Text className="text-foreground font-bold text-[13px]">
                      {DateTime.fromMillis(entry.preachingDate).toFormat(
                        'd LLL',
                      )}
                    </Text>
                    <Text className="text-muted-foreground text-xs mt-0.5">
                      {entry.hours}h {entry.minutes}m •{' '}
                      {TYPE_LABELS[entry.type]}
                    </Text>
                  </View>
                  <View className="flex-row gap-1.5 flex-shrink-0">
                    <Pressable
                      onPress={() => handleEdit(entry)}
                      className="p-2 bg-muted border border-border rounded-lg active:bg-muted/80"
                    >
                      <Text className="text-xs">✏️</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => openDeleteModal(entry.id)}
                      className="p-2 bg-red-50 border border-red-200 rounded-lg active:bg-red-100"
                    >
                      <Text className="text-xs">🗑️</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
