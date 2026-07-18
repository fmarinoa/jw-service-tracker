import {
  DEFAULT_GOALS,
  formatMonthYearHeader,
  PREACHER_TYPE_LABELS,
  PreacherType,
  SessionType,
} from '@jw-tracker/shared';
import { DateTime } from 'luxon';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ConfirmDeleteDialog from '../../src/features/dashboard/components/ConfirmDeleteDialog';
import EntryDialog from '../../src/features/dashboard/components/EntryDialog';
// Subcomponents
import ProgressCircle from '../../src/features/dashboard/components/ProgressCircle';
import RecentActivityCard from '../../src/features/dashboard/components/RecentActivityCard';
import SummaryCard from '../../src/features/dashboard/components/SummaryCard';
import { useDashboard } from '../../src/features/dashboard/DashboardProvider';

const TYPE_LABELS: Record<SessionType, string> = {
  house_to_house: 'Casa en casa',
  revisits: 'Revisitas',
  bible_study: 'Estudio Bíblico',
  other: 'Otro',
};

const TYPE_EMOJIS: Record<SessionType, string> = {
  house_to_house: '🏠',
  revisits: '🔄',
  bible_study: '📚',
  other: '💬',
};

export default function DashboardPage() {
  const {
    user,
    isLoading,

    setShowAddModal,
    showSettingsModal,
    setShowSettingsModal,
    settingsPreacherType,
    settingsMonthlyGoal,
    setSettingsMonthlyGoal,
    isSavingSettings,
    settingsError,
    showExportSuccess,
    disableLogout,

    reportedHours,
    progressPercentage,
    hoursLeft,
    percentageLeft,
    stats,

    showExportOptions,
    setShowExportOptions,
    exportingMonthOffset,
    monthOffset,
    handleMonthChange,

    openSettingsModal,
    handleLogout,
    handlePreacherTypeChange,
    handleSaveSettings,
    resetForm,
    handleExportReport,
  } = useDashboard();

  if (isLoading || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#b86a3d" />
        <Text className="text-muted-foreground mt-4 font-medium">
          Cargando panel...
        </Text>
      </View>
    );
  }

  const capitalizedMonthLabel = formatMonthYearHeader(
    DateTime.now().setZone('America/Lima').plus({ months: monthOffset }),
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
          {/* HEADER */}
          <View className="flex-row justify-between items-center pb-4 border-b border-border">
            <View>
              <Text className="text-3xl font-black tracking-tight text-primary">
                JW Tracker
              </Text>
              <Text className="text-xs text-muted-foreground mt-1 font-semibold">
                {PREACHER_TYPE_LABELS[user.preacherType || 'publisher']}
                {user.monthlyGoal > 0
                  ? ` • Meta: ${user.monthlyGoal} horas`
                  : ''}
              </Text>
            </View>
            <View className="flex-row items-center space-x-3">
              <Pressable
                onPress={openSettingsModal}
                className="flex-row items-center space-x-1.5 px-3 py-2 bg-card border border-border rounded-lg active:bg-muted"
              >
                <Text className="text-xs font-semibold text-foreground">
                  ⚙️ Configurar
                </Text>
              </Pressable>
              <Text className="text-sm font-semibold text-foreground hidden sm:inline px-2">
                {user.name || user.phone}
              </Text>
              <Pressable
                disabled={disableLogout}
                onPress={handleLogout}
                className="p-2 bg-red-50 border border-red-200 rounded-lg active:bg-red-100"
              >
                <Text className="text-sm">🚪</Text>
              </Pressable>
            </View>
          </View>

          {/* MONTH SWITCHER */}
          <View className="flex-row justify-between items-center bg-card border border-border p-3 rounded-xl">
            <Pressable
              onPress={() => handleMonthChange(monthOffset - 1)}
              disabled={monthOffset <= -2}
              className={`px-3 py-1.5 bg-muted rounded-lg active:bg-muted/80 ${
                monthOffset <= -2 ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-foreground text-xs font-bold">
                ◀ Anterior
              </Text>
            </Pressable>
            <Text className="text-foreground font-bold text-sm">
              {capitalizedMonthLabel}
            </Text>
            <Pressable
              onPress={() => handleMonthChange(monthOffset + 1)}
              disabled={monthOffset >= 0}
              className={`px-3 py-1.5 bg-muted rounded-lg active:bg-muted/80 ${
                monthOffset >= 0 ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-foreground text-xs font-bold">
                Siguiente ▶
              </Text>
            </Pressable>
          </View>

          {/* STATS SUMMARY CARDS */}
          <View className="flex-col sm:flex-row gap-4 space-y-4 sm:space-y-0">
            <SummaryCard
              label="Horas del Mes"
              value={`${reportedHours}h`}
              icon="⏱️"
              subtitle={
                user.monthlyGoal > 0
                  ? `${progressPercentage}% de la meta`
                  : 'Sin meta configurada'
              }
              onPress={() => {
                resetForm();
                setShowAddModal(true);
              }}
              actionLabel="➕ Registrar"
            />
            <SummaryCard
              label="Meta Mensual"
              value={user.monthlyGoal > 0 ? `${user.monthlyGoal}h` : 'Sin meta'}
              icon="🎯"
              subtitle={
                user.monthlyGoal > 0
                  ? `Tipo: ${PREACHER_TYPE_LABELS[user.preacherType || 'publisher']}`
                  : 'Configura una meta'
              }
              onPress={openSettingsModal}
              actionLabel="⚙️ Ajustar"
            />
            {user.monthlyGoal > 0 && (
              <SummaryCard
                label="Restante"
                value={`${hoursLeft}h`}
                icon="⏳"
                subtitle={
                  reportedHours >= user.monthlyGoal
                    ? '🎉 ¡Meta completada!'
                    : `Faltan ${hoursLeft} horas (${percentageLeft}%)`
                }
              />
            )}
          </View>

          {/* MAIN PANEL GRID */}
          <View className="flex-col md:flex-row gap-6 space-y-6 md:space-y-0">
            {/* PROGRESS CIRCLE CARD */}
            <View className="flex-1 bg-card border border-border rounded-2xl p-6 shadow-sm items-center justify-center">
              <Text className="text-base font-bold text-foreground mb-2">
                Progreso Visual
              </Text>
              <ProgressCircle
                progressPercentage={progressPercentage}
                reportedHours={reportedHours}
                monthlyGoal={user.monthlyGoal}
              />
            </View>

            {/* SUMMARY BY CATEGORY */}
            <View className="w-full md:w-80 bg-card border border-border rounded-2xl p-6 shadow-sm">
              <Text className="text-base font-bold text-foreground mb-4">
                Por Categoría
              </Text>
              <View className="space-y-3.5">
                {(Object.keys(TYPE_LABELS) as SessionType[]).map((type) => (
                  <View
                    key={type}
                    className="flex-row justify-between items-center text-sm"
                  >
                    <View className="flex-row items-center space-x-2">
                      <Text className="text-base">{TYPE_EMOJIS[type]}</Text>
                      <Text className="text-foreground font-medium">
                        {TYPE_LABELS[type]}
                      </Text>
                    </View>
                    <Text className="font-bold text-foreground">
                      {Math.floor((stats.byType[type] || 0) / 60)}h
                    </Text>
                  </View>
                ))}

                {showExportSuccess ? (
                  <View className="w-full mt-3 h-10 justify-center items-center bg-green-50 border border-green-200 rounded-lg">
                    <Text className="text-sm font-bold text-green-700">
                      ¡Copiado al portapapeles!
                    </Text>
                  </View>
                ) : showExportOptions ? (
                  <View className="space-y-2 mt-3 pt-3 border-t border-border">
                    <Text className="text-xs text-muted-foreground font-semibold mb-1">
                      Selecciona el mes para exportar:
                    </Text>
                    <View className="space-y-1.5">
                      {[0, -1, -2].map((offset) => {
                        const targetDate = DateTime.now()
                          .setZone('America/Lima')
                          .plus({ months: offset });
                        const capitalizedLabel =
                          formatMonthYearHeader(targetDate);
                        return (
                          <Pressable
                            key={offset}
                            onPress={() => {
                              handleExportReport(offset);
                              setShowExportOptions(false);
                            }}
                            disabled={exportingMonthOffset !== null}
                            className="w-full py-2 bg-muted border border-border rounded-lg items-center active:bg-muted/80"
                          >
                            <Text className="text-xs font-semibold text-foreground">
                              {exportingMonthOffset === offset
                                ? 'Copiando...'
                                : capitalizedLabel}
                            </Text>
                          </Pressable>
                        );
                      })}
                      <Pressable
                        onPress={() => setShowExportOptions(false)}
                        className="w-full py-1.5 items-center mt-1"
                      >
                        <Text className="text-xs font-semibold text-muted-foreground active:text-foreground">
                          Cancelar
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setShowExportOptions(true)}
                    className="w-full mt-3 py-2.5 bg-muted border border-border rounded-xl items-center active:bg-muted/80"
                  >
                    <Text className="text-foreground font-bold text-xs">
                      📤 Exportar Reporte
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* RECENT ACTIVITY */}
          <View>
            <RecentActivityCard />
          </View>
        </View>

        {/* ADD / EDIT ENTRY MODAL */}
        <EntryDialog />

        {/* CONFIRM DELETE MODAL */}
        <ConfirmDeleteDialog />

        {/* CONFIG / SETTINGS MODAL */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSettingsModal}
          onRequestClose={() => setShowSettingsModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/60 p-4">
            <Pressable
              className="absolute inset-0"
              onPress={() => setShowSettingsModal(false)}
            />
            <View className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
              <Text className="text-xl font-bold text-foreground">
                Configuración de Predicador
              </Text>

              <View className="space-y-3.5">
                <View>
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Tipo de Predicador
                  </Text>
                  <View className="space-y-2">
                    {(Object.keys(PREACHER_TYPE_LABELS) as PreacherType[]).map(
                      (type) => {
                        const isSelected = settingsPreacherType === type;
                        return (
                          <Pressable
                            key={type}
                            onPress={() => handlePreacherTypeChange(type)}
                            className={`p-3 border rounded-xl flex-row justify-between items-center ${
                              isSelected
                                ? 'bg-primary/10 border-primary'
                                : 'bg-background border-border'
                            }`}
                          >
                            <Text
                              className={`text-sm font-semibold ${isSelected ? 'text-primary font-bold' : 'text-foreground'}`}
                            >
                              {PREACHER_TYPE_LABELS[type]}
                            </Text>
                            {DEFAULT_GOALS[type] !== null ? (
                              <Text className="text-xs text-muted-foreground font-medium">
                                Meta: {DEFAULT_GOALS[type]}h
                              </Text>
                            ) : (
                              <Text className="text-xs text-muted-foreground font-medium">
                                Meta libre
                              </Text>
                            )}
                          </Pressable>
                        );
                      },
                    )}
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Meta de Horas Mensual
                    </Text>
                    {DEFAULT_GOALS[settingsPreacherType] !== null ? (
                      <Pressable
                        onPress={() =>
                          setSettingsMonthlyGoal(
                            DEFAULT_GOALS[settingsPreacherType] || 0,
                          )
                        }
                      >
                        <Text className="text-[10px] text-primary font-bold active:underline">
                          Restablecer por defecto (
                          {DEFAULT_GOALS[settingsPreacherType]}h)
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <TextInput
                    keyboardType="numeric"
                    value={settingsMonthlyGoal.toString()}
                    onChangeText={(val) => {
                      setSettingsMonthlyGoal(
                        val === '' ? '' : parseInt(val) || 0,
                      );
                    }}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground text-sm"
                  />
                  <Text className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    Esta meta se utilizará para calcular tu progreso mensual en
                    el panel principal.
                  </Text>
                </View>
              </View>

              {settingsError ? (
                <Text className="text-red-600 text-xs font-semibold">
                  ⚠️ {settingsError}
                </Text>
              ) : null}

              <View className="flex-row space-x-3 pt-2">
                <Pressable
                  onPress={() => setShowSettingsModal(false)}
                  className="flex-1 py-3 bg-muted border border-border rounded-xl items-center active:bg-muted/80"
                >
                  <Text className="text-foreground font-bold text-sm">
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable
                  disabled={isSavingSettings}
                  onPress={handleSaveSettings}
                  className="flex-1 py-3 bg-primary rounded-xl items-center active:bg-primary/90"
                >
                  <Text className="text-primary-foreground font-bold text-sm">
                    {isSavingSettings ? 'Guardando...' : 'Guardar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
