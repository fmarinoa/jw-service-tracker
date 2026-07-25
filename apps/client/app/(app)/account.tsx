import {
  DEFAULT_GOALS,
  PREACHER_TYPE_LABELS,
  PreacherType,
} from '@jw-tracker/shared';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDashboard } from '../../src/features/dashboard/DashboardProvider';
import { useFloatingTabBarClearance } from '../../src/features/dashboard/useFloatingTabBarOffset';

export default function AccountScreen() {
  const {
    user,
    isLoading,
    openSettingsModal,
    settingsPreacherType,
    settingsMonthlyGoal,
    setSettingsMonthlyGoal,
    isSavingSettings,
    settingsError,
    handlePreacherTypeChange,
    handleSaveSettings,
    disableLogout,
    handleLogout,
  } = useDashboard();
  const tabBarClearance = useFloatingTabBarClearance();
  const insets = useSafeAreaInsets();

  const [showSavedToast, setShowSavedToast] = useState(false);
  const wasSaving = useRef(false);

  // Prefill settings draft from the loaded user profile on mount
  useEffect(() => {
    if (user) {
      openSettingsModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (wasSaving.current && !isSavingSettings && !settingsError) {
      setShowSavedToast(true);
      const timer = setTimeout(() => setShowSavedToast(false), 1800);
      return () => clearTimeout(timer);
    }
    wasSaving.current = isSavingSettings;
  }, [isSavingSettings, settingsError]);

  if (isLoading || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#b86a3d" />
      </View>
    );
  }

  const userInitial = (user.name || user.phone).charAt(0).toUpperCase();
  const defaultGoalForSelected = DEFAULT_GOALS[settingsPreacherType];
  const showResetDefault =
    defaultGoalForSelected !== null &&
    defaultGoalForSelected !== settingsMonthlyGoal;
  const isDirty =
    settingsPreacherType !== user.preacherType ||
    settingsMonthlyGoal !== user.monthlyGoal;

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
          <Text className="text-foreground font-extrabold text-[22px]">
            Perfil
          </Text>

          {/* USER CARD */}
          <View className="flex-row items-center gap-3 bg-card border border-border rounded-[18px] p-4">
            <View className="w-[50px] h-[50px] rounded-2xl bg-primary/10 items-center justify-center flex-shrink-0">
              <Text className="text-primary font-extrabold text-lg">
                {userInitial}
              </Text>
            </View>
            <View>
              <Text className="text-foreground font-extrabold text-base">
                {user.name || user.phone}
              </Text>
              <Text className="text-muted-foreground text-xs mt-0.5">
                {user.phone}
              </Text>
            </View>
          </View>

          {/* SETTINGS CARD */}
          <View className="bg-card border border-border rounded-2xl p-5">
            <Text className="text-foreground font-extrabold text-[14.5px] mb-3">
              Tipo de predicador
            </Text>

            {(Object.keys(PREACHER_TYPE_LABELS) as PreacherType[]).map(
              (type) => {
                const isSelected = settingsPreacherType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => handlePreacherTypeChange(type)}
                    className={`flex-row justify-between items-center px-3.5 py-3 mb-2 rounded-xl border ${
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'bg-background border-border'
                    }`}
                  >
                    <Text
                      className={`text-[13.5px] ${
                        isSelected
                          ? 'text-primary font-extrabold'
                          : 'text-foreground font-bold'
                      }`}
                    >
                      {PREACHER_TYPE_LABELS[type]}
                    </Text>
                    <Text className="text-muted-foreground text-xs font-semibold">
                      {DEFAULT_GOALS[type] !== null
                        ? `Meta: ${DEFAULT_GOALS[type]}h`
                        : 'Meta libre'}
                    </Text>
                  </Pressable>
                );
              },
            )}

            <View className="mt-4">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Meta mensual (horas)
                </Text>
                {showResetDefault && (
                  <Pressable
                    onPress={() =>
                      setSettingsMonthlyGoal(defaultGoalForSelected || 0)
                    }
                  >
                    <Text className="text-primary font-bold text-[10.5px]">
                      Restablecer a {defaultGoalForSelected}h
                    </Text>
                  </Pressable>
                )}
              </View>
              <TextInput
                keyboardType="numeric"
                value={settingsMonthlyGoal.toString()}
                onChangeText={(val) =>
                  setSettingsMonthlyGoal(
                    val === '' ? '' : parseInt(val, 10) || 0,
                  )
                }
                className="w-full px-3.5 py-3 bg-background border border-border rounded-xl text-foreground text-[15px] font-extrabold"
              />
            </View>

            {settingsError ? (
              <Text className="text-red-600 text-xs font-semibold mt-3">
                ⚠️ {settingsError}
              </Text>
            ) : null}

            <Pressable
              disabled={isSavingSettings || !isDirty}
              onPress={handleSaveSettings}
              className={`w-full mt-4 py-3.5 bg-primary rounded-2xl items-center active:bg-primary/90 ${
                isDirty && !isSavingSettings ? '' : 'opacity-50'
              }`}
            >
              <Text className="text-primary-foreground font-bold text-[14.5px]">
                {isSavingSettings ? 'Guardando...' : 'Guardar cambios'}
              </Text>
            </Pressable>

            {showSavedToast && (
              <Text
                className="text-center font-bold text-[12.5px] mt-2.5"
                style={{ color: '#5c7a52' }}
              >
                Cambios guardados
              </Text>
            )}
          </View>

          {/* LOGOUT */}
          <Pressable
            disabled={disableLogout}
            onPress={handleLogout}
            className="w-full py-3.5 border rounded-2xl flex-row items-center justify-center gap-2 active:bg-red-50"
            style={{ borderColor: 'rgba(168, 67, 47, 0.35)' }}
          >
            <Text className="text-base">🚪</Text>
            <Text className="font-bold text-sm" style={{ color: '#a8432f' }}>
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
