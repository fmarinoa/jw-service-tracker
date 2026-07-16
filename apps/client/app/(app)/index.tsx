import { DateTime } from "luxon";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useDashboard } from "../../src/features/dashboard/DashboardProvider";
import {
  DEFAULT_GOALS,
  PREACHER_TYPE_LABELS,
  PreacherType,
  SessionType,
} from "@jw-tracker/shared";

const TYPE_LABELS: Record<SessionType, string> = {
  house_to_house: "Casa en casa",
  revisits: "Revisitas",
  bible_study: "Estudio Bíblico",
  other: "Otro",
};

const TYPE_EMOJIS: Record<SessionType, string> = {
  house_to_house: "🏠",
  revisits: "🔄",
  bible_study: "📚",
  other: "💬",
};

export default function DashboardPage() {
  const {
    user,
    entries,
    isLoading,
    isEntriesLoading,

    showAddModal,
    setShowAddModal,
    showDeleteModal,
    setShowDeleteModal,
    isDeleting,
    editingEntry,
    formError,
    setFormError,
    isSubmitting,

    showSettingsModal,
    setShowSettingsModal,
    settingsPreacherType,
    setSettingsPreacherType,
    settingsMonthlyGoal,
    setSettingsMonthlyGoal,
    isSavingSettings,
    settingsError,
    showExportSuccess,
    disableLogout,

    formDate,
    setFormDate,
    formHours,
    setFormHours,
    formMinutes,
    setFormMinutes,
    formType,
    setFormType,
    formNotes,
    setFormNotes,

    reportedHours,
    progressPercentage,
    hoursLeft,
    percentageLeft,
    circumference,
    strokeDashoffset,
    hasChanges,
    stats,

    page,
    totalPages,
    fetchDashboardData,
    showExportOptions,
    setShowExportOptions,
    exportingMonthOffset,
    monthOffset,
    handleMonthChange,

    openSettingsModal,
    handleLogout,
    handlePreacherTypeChange,
    handleSaveSettings,
    handleSaveEntry,
    handleDelete,
    openDeleteModal,
    handleEdit,
    resetForm,
    handleExportReport,
  } = useDashboard();

  if (isLoading || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#b86a3d" />
        <Text className="text-muted-foreground mt-4 font-medium">Cargando panel...</Text>
      </View>
    );
  }

  const formatLongDate = (millis: number) => {
    const dt = DateTime.fromMillis(millis).setLocale("es");
    const formatted = dt.toFormat("EEEE d 'de' MMMM 'del' yyyy");
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const currentMonthLabel = DateTime.now()
    .setZone("America/Lima")
    .plus({ months: monthOffset })
    .setLocale("es")
    .toFormat("MMMM yyyy");
  const capitalizedMonthLabel =
    currentMonthLabel.charAt(0).toUpperCase() + currentMonthLabel.slice(1);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        
        {/* HEADER */}
        <View className="flex-row justify-between items-center pb-4 border-b border-border">
          <View>
            <Text className="text-3xl font-black tracking-tight text-primary">
              JW Tracker
            </Text>
            <Text className="text-xs text-muted-foreground mt-1 font-semibold">
              {PREACHER_TYPE_LABELS[user.preacherType || "publisher"]}
              {user.monthlyGoal > 0 ? ` • Meta: ${user.monthlyGoal} horas` : ""}
            </Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <Pressable
              onPress={openSettingsModal}
              className="flex-row items-center space-x-1.5 px-3 py-2 bg-card border border-border rounded-lg active:bg-muted"
            >
              <Text className="text-xs font-semibold text-foreground">⚙️ Configurar</Text>
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
            className="px-3 py-1.5 bg-muted rounded-lg active:bg-muted/80"
          >
            <Text className="text-foreground text-xs font-bold">◀ Anterior</Text>
          </Pressable>
          <Text className="text-foreground font-bold text-sm">{capitalizedMonthLabel}</Text>
          <Pressable
            onPress={() => handleMonthChange(monthOffset + 1)}
            className="px-3 py-1.5 bg-muted rounded-lg active:bg-muted/80"
          >
            <Text className="text-foreground text-xs font-bold">Siguiente ▶</Text>
          </Pressable>
        </View>

        {/* MAIN PANEL GRID */}
        <View className="flex-col md:flex-row gap-6 space-y-6 md:space-y-0">
          
          {/* HOURS CARD */}
          <View className="flex-1 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Horas del Mes
                </Text>
                <Text className="text-5xl font-black text-foreground mt-2">
                  {reportedHours}h
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="flex-row items-center space-x-1.5 px-4 py-2.5 bg-primary rounded-xl active:bg-primary/90 shadow-sm"
              >
                <Text className="text-primary-foreground font-bold text-sm">➕ Registrar</Text>
              </Pressable>
            </View>

            {user.monthlyGoal > 0 ? (
              <View className="mt-6 space-y-3">
                <View className="flex-row justify-between text-xs font-semibold text-muted-foreground">
                  <Text className="text-muted-foreground">Progreso de la meta</Text>
                  <Text className="text-primary font-bold">
                    {reportedHours} de {user.monthlyGoal} horas ({progressPercentage}%)
                  </Text>
                </View>
                <View className="w-full bg-muted h-3 rounded-full overflow-hidden">
                  <View
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </View>
                {reportedHours >= user.monthlyGoal ? (
                  <Text className="text-xs text-green-700 font-bold mt-2">
                    🎉 ¡Felicidades! Has completado tu meta del mes.
                  </Text>
                ) : (
                  <Text className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Llevas el <Text className="font-bold text-foreground">{progressPercentage}%</Text> de tu meta. Te faltan <Text className="font-bold text-primary">{hoursLeft} horas</Text> para cumplirla ({percentageLeft}% restante).
                  </Text>
                )}
              </View>
            ) : (
              <View className="mt-6 pt-4 border-t border-border flex-row justify-between items-center">
                <Text className="text-xs text-muted-foreground">Sin meta de horas configurada.</Text>
                <Pressable onPress={openSettingsModal}>
                  <Text className="text-xs text-primary font-bold active:underline">Configurar una meta</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* SUMMARY CARD */}
          <View className="w-full md:w-80 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <Text className="text-base font-bold text-foreground mb-4">Resumen</Text>
            <View className="space-y-3.5">
              {(Object.keys(TYPE_LABELS) as SessionType[]).map((type) => (
                <View key={type} className="flex-row justify-between items-center text-sm">
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-base">{TYPE_EMOJIS[type]}</Text>
                    <Text className="text-foreground font-medium">{TYPE_LABELS[type]}</Text>
                  </View>
                  <Text className="font-bold text-foreground">
                    {Math.floor((stats.byType[type] || 0) / 60)}h
                  </Text>
                </View>
              ))}

              {showExportSuccess ? (
                <View className="w-full mt-3 h-10 justify-center items-center bg-green-50 border border-green-200 rounded-lg">
                  <Text className="text-sm font-bold text-green-700">¡Copiado al portapapeles!</Text>
                </View>
              ) : showExportOptions ? (
                <View className="space-y-2 mt-3 pt-3 border-t border-border">
                  <Text className="text-xs text-muted-foreground font-semibold mb-1">
                    Selecciona el mes para exportar:
                  </Text>
                  <View className="space-y-1.5">
                    {[0, -1, -2].map((offset) => {
                      const targetDate = DateTime.now()
                        .setZone("America/Lima")
                        .plus({ months: offset });
                      const label = targetDate.setLocale("es").toFormat("MMMM yyyy");
                      const capitalizedLabel =
                        label.charAt(0).toUpperCase() + label.slice(1);
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
                            {exportingMonthOffset === offset ? "Copiando..." : capitalizedLabel}
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
                  <Text className="text-foreground font-bold text-xs">📤 Exportar Reporte</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* RECENT ACTIVITY */}
        <View className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <Text className="text-base font-bold text-foreground mb-4">Actividad Reciente</Text>
          
          {isEntriesLoading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator color="#b86a3d" />
              <Text className="text-muted-foreground text-xs mt-2">Cargando registros...</Text>
            </View>
          ) : entries.length === 0 ? (
            <View className="py-10 items-center justify-center">
              <Text className="text-muted-foreground font-medium text-sm text-center">
                No hay registros para este mes
              </Text>
            </View>
          ) : (
            <View className="divide-y divide-border">
              {entries.map((entry) => (
                <View key={entry.id} className="py-4 flex-row justify-between items-center">
                  <View className="flex-1 pr-4">
                    <Text className="font-semibold text-foreground text-sm sm:text-base">
                      {formatLongDate(entry.preachingDate)}
                    </Text>
                    <Text className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {entry.hours}h {entry.minutes}m • {TYPE_LABELS[entry.type]}
                    </Text>
                    {entry.notes ? (
                      <Text className="text-xs text-muted-foreground mt-1 italic">
                        "{entry.notes}"
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-row space-x-2">
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
              ))}

              {/* PAGINATION */}
              {totalPages > 1 ? (
                <View className="flex-row items-center justify-between pt-4 mt-2">
                  <Pressable
                    onPress={() => fetchDashboardData(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1.5 bg-muted border border-border rounded-lg active:bg-muted/80 ${
                      page === 1 ? "opacity-50" : ""
                    }`}
                  >
                    <Text className="text-foreground text-xs font-bold">◀ Anterior</Text>
                  </Pressable>
                  <Text className="text-xs text-muted-foreground font-semibold">
                    Página {page} de {totalPages}
                  </Text>
                  <Pressable
                    onPress={() => fetchDashboardData(page + 1)}
                    disabled={page === totalPages}
                    className={`px-3 py-1.5 bg-muted border border-border rounded-lg active:bg-muted/80 ${
                      page === totalPages ? "opacity-50" : ""
                    }`}
                  >
                    <Text className="text-foreground text-xs font-bold">Siguiente ▶</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}
        </View>

      </View>

      {/* ADD / EDIT ENTRY MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <View className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <Text className="text-xl font-bold text-foreground">
              {editingEntry ? "Editar Registro" : "Nuevo Registro"}
            </Text>

            <View className="space-y-3.5">
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Fecha (YYYY-MM-DD)
                  </Text>
                  <TextInput
                    value={formDate}
                    onChangeText={setFormDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#7b726c"
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground text-sm"
                  />
                </View>
                <View className="w-20">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Horas
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={formHours.toString()}
                    onChangeText={(val) => {
                      setFormHours(val === "" ? "" : parseInt(val) || 0);
                    }}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground text-sm text-center"
                  />
                </View>
                <View className="w-20">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Mins
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={formMinutes.toString()}
                    onChangeText={(val) => {
                      setFormMinutes(val === "" ? "" : parseInt(val) || 0);
                    }}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground text-sm text-center"
                  />
                </View>
              </View>

              <View>
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Tipo
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {(Object.keys(TYPE_LABELS) as SessionType[]).map((type) => {
                    const isSelected = formType === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => setFormType(type)}
                        className={`px-3 py-2 border rounded-lg ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "bg-background border-border"
                        }`}
                      >
                        <Text className={`text-xs font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                          {TYPE_EMOJIS[type]} {TYPE_LABELS[type]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Notas
                  </Text>
                  <Text className="text-[10px] text-muted-foreground">
                    {formNotes.length}/50
                  </Text>
                </View>
                <TextInput
                  value={formNotes}
                  onChangeText={(val) => setFormNotes(val.slice(0, 50))}
                  placeholder="Notas opcionales..."
                  placeholderTextColor="#7b726c"
                  multiline
                  numberOfLines={2}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground text-sm"
                />
              </View>
            </View>

            {formError ? (
              <Text className="text-red-600 text-xs font-semibold">
                ⚠️ {formError}
              </Text>
            ) : null}

            <View className="flex-row space-x-3 pt-2">
              <Pressable
                onPress={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-muted border border-border rounded-xl items-center active:bg-muted/80"
              >
                <Text className="text-foreground font-bold text-sm">Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={isSubmitting || !!(editingEntry && !hasChanges)}
                onPress={handleSaveEntry}
                className="flex-1 py-3 bg-primary rounded-xl items-center active:bg-primary/90 disabled:opacity-50"
              >
                <Text className="text-primary-foreground font-bold text-sm">
                  {isSubmitting ? "Guardando..." : editingEntry ? "Actualizar" : "Guardar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* CONFIG / SETTINGS MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSettingsModal}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
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
                  {(Object.keys(PREACHER_TYPE_LABELS) as PreacherType[]).map((type) => {
                    const isSelected = settingsPreacherType === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => handlePreacherTypeChange(type)}
                        className={`p-3 border rounded-xl flex-row justify-between items-center ${
                          isSelected
                            ? "bg-primary/10 border-primary"
                            : "bg-background border-border"
                        }`}
                      >
                        <Text className={`text-sm font-semibold ${isSelected ? "text-primary font-bold" : "text-foreground"}`}>
                          {PREACHER_TYPE_LABELS[type]}
                        </Text>
                        {DEFAULT_GOALS[type] !== null ? (
                          <Text className="text-xs text-muted-foreground font-medium">
                            Meta: {DEFAULT_GOALS[type]}h
                          </Text>
                        ) : (
                          <Text className="text-xs text-muted-foreground font-medium">Meta libre</Text>
                        )}
                      </Pressable>
                    );
                  })}
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
                        setSettingsMonthlyGoal(DEFAULT_GOALS[settingsPreacherType] || 0)
                      }
                    >
                      <Text className="text-[10px] text-primary font-bold active:underline">
                        Restablecer por defecto ({DEFAULT_GOALS[settingsPreacherType]}h)
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
                <TextInput
                  keyboardType="numeric"
                  value={settingsMonthlyGoal.toString()}
                  onChangeText={(val) => {
                    setSettingsMonthlyGoal(val === "" ? "" : parseInt(val) || 0);
                  }}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground text-sm"
                />
                <Text className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Esta meta se utilizará para calcular tu progreso mensual en el panel principal.
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
                <Text className="text-foreground font-bold text-sm">Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={isSavingSettings}
                onPress={handleSaveSettings}
                className="flex-1 py-3 bg-primary rounded-xl items-center active:bg-primary/90"
              >
                <Text className="text-primary-foreground font-bold text-sm">
                  {isSavingSettings ? "Guardando..." : "Guardar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <View className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4">
            <Text className="text-lg font-bold text-foreground">¿Eliminar registro?</Text>
            <Text className="text-sm text-muted-foreground leading-relaxed">
              Esta acción no se puede deshacer. El registro de predicación se borrará permanentemente.
            </Text>
            <View className="flex-row space-x-3 pt-2">
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-muted border border-border rounded-xl items-center active:bg-muted/80"
              >
                <Text className="text-foreground font-semibold text-sm">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 rounded-xl items-center active:bg-red-700"
              >
                <Text className="text-white font-bold text-sm">
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}
