import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useDashboard } from "../DashboardProvider";
import { SessionType } from "@jw-tracker/shared";

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

export default function EntryDialog() {
  const {
    showAddModal,
    setShowAddModal,
    editingEntry,
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
    formError,
    isSubmitting,
    handleSaveEntry,
    hasChanges,
  } = useDashboard();

  return (
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
  );
}
