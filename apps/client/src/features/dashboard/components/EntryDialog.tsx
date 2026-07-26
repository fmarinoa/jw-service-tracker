import { formatIsoToShortDate, SessionType } from '@jw-tracker/shared';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useDashboard } from '../DashboardProvider';
import CalendarPicker from './CalendarPicker';
import { CategoryIcon } from './icons';

const TYPE_LABELS: Record<SessionType, string> = {
  house_to_house: 'Casa en casa',
  revisits: 'Revisitas',
  bible_study: 'Estudio Bíblico',
  other: 'Otro',
};

const TYPES: SessionType[] = [
  'house_to_house',
  'revisits',
  'bible_study',
  'other',
];

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

  const [showDatePicker, setShowDatePicker] = useState(false);

  const stepHours = (delta: number) => {
    const current = formHours === '' ? 0 : Number(formHours);
    setFormHours(Math.max(0, Math.min(24, current + delta)));
  };
  const stepMinutes = (delta: number) => {
    const current = formMinutes === '' ? 0 : Number(formMinutes);
    let next = current + delta;
    if (next < 0) next = 55;
    if (next > 55) next = 0;
    setFormMinutes(next);
  };
  const handleHoursInput = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '');
    setFormHours(digits === '' ? '' : Math.min(24, parseInt(digits, 10)));
  };
  const handleMinutesInput = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '');
    setFormMinutes(digits === '' ? '' : Math.min(59, parseInt(digits, 10)));
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showAddModal}
      onRequestClose={() => setShowAddModal(false)}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : Platform.OS === 'android'
              ? 'height'
              : undefined
        }
      >
        <View className="flex-1 justify-center px-5 bg-black/50">
          <Pressable
            className="absolute inset-0"
            onPress={() => setShowAddModal(false)}
          />
          <View className="bg-card rounded-[24px] px-5 pt-5 pb-7 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-foreground font-extrabold text-[19px]">
                {editingEntry ? 'Editar registro' : 'Registrar horas'}
              </Text>
              <Pressable
                onPress={() => setShowAddModal(false)}
                className="w-[30px] h-[30px] rounded-full bg-muted items-center justify-center active:bg-muted/80"
              >
                <Text className="text-foreground font-bold">✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="pb-1">
                {/* DATE */}
                <View className="mb-4">
                  <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Fecha
                  </Text>
                  <Pressable
                    onPress={() => setShowDatePicker(!showDatePicker)}
                    className="w-full px-3.5 py-3 bg-background border border-border rounded-xl flex-row justify-between items-center active:bg-muted"
                  >
                    <Text className="text-foreground text-[14.5px] font-semibold">
                      {formDate
                        ? formatIsoToShortDate(formDate)
                        : 'Seleccionar...'}
                    </Text>
                    <Text className="text-[17px]">📅</Text>
                  </Pressable>
                </View>

                {/* HOURS / MINUTES */}
                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Horas
                    </Text>
                    <View className="flex-row items-center bg-background border border-border rounded-xl overflow-hidden">
                      <Pressable
                        onPress={() => stepHours(-1)}
                        className="w-[38px] h-11 bg-muted items-center justify-center active:bg-muted/70"
                      >
                        <Text className="text-foreground font-bold text-[17px]">
                          −
                        </Text>
                      </Pressable>
                      <TextInput
                        keyboardType="numeric"
                        value={formHours === '' ? '' : String(formHours)}
                        onChangeText={handleHoursInput}
                        selectTextOnFocus
                        className="flex-1 min-w-0 text-center text-foreground font-extrabold text-base"
                      />
                      <Pressable
                        onPress={() => stepHours(1)}
                        className="w-[38px] h-11 bg-muted items-center justify-center active:bg-muted/70"
                      >
                        <Text className="text-foreground font-bold text-[17px]">
                          +
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Minutos
                    </Text>
                    <View className="flex-row items-center bg-background border border-border rounded-xl overflow-hidden">
                      <Pressable
                        onPress={() => stepMinutes(-5)}
                        className="w-[38px] h-11 bg-muted items-center justify-center active:bg-muted/70"
                      >
                        <Text className="text-foreground font-bold text-[17px]">
                          −
                        </Text>
                      </Pressable>
                      <TextInput
                        keyboardType="numeric"
                        value={formMinutes === '' ? '' : String(formMinutes)}
                        onChangeText={handleMinutesInput}
                        selectTextOnFocus
                        className="flex-1 min-w-0 text-center text-foreground font-extrabold text-base"
                      />
                      <Pressable
                        onPress={() => stepMinutes(5)}
                        className="w-[38px] h-11 bg-muted items-center justify-center active:bg-muted/70"
                      >
                        <Text className="text-foreground font-bold text-[17px]">
                          +
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* TYPE */}
                <View className="mb-4">
                  <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
                    Tipo
                  </Text>
                  <View className="flex-row flex-wrap gap-2.5">
                    {TYPES.map((type) => {
                      const isSelected = formType === type;
                      return (
                        <Pressable
                          key={type}
                          onPress={() => setFormType(type)}
                          className={`flex-row items-center gap-2 px-3.5 py-2.5 rounded-xl border basis-[47%] flex-1 ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'bg-background border-border'
                          }`}
                        >
                          <CategoryIcon
                            type={type}
                            color={isSelected ? '#fdfbf7' : '#7b726c'}
                          />
                          <Text
                            className={`text-xs font-bold ${
                              isSelected
                                ? 'text-primary-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {TYPE_LABELS[type]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* NOTES */}
                <View className="mb-1">
                  <View className="flex-row justify-between mb-1.5">
                    <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      Notas
                    </Text>
                    <Text className="text-[10.5px] text-muted-foreground">
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
                    className="w-full px-3.5 py-3 bg-background border border-border rounded-xl text-foreground text-sm"
                  />
                </View>
              </View>
            </ScrollView>

            {formError ? (
              <Text className="text-red-600 text-xs font-semibold mb-2">
                ⚠️ {formError}
              </Text>
            ) : null}

            <View className="flex-row gap-2.5 mt-2">
              <Pressable
                onPress={() => setShowAddModal(false)}
                className="flex-1 py-3.5 bg-muted rounded-2xl items-center active:bg-muted/80"
              >
                <Text className="text-foreground font-bold text-[14.5px]">
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                disabled={isSubmitting || !!(editingEntry && !hasChanges)}
                onPress={handleSaveEntry}
                className="flex-1 py-3.5 bg-primary rounded-2xl items-center active:bg-primary/90 disabled:opacity-50"
              >
                <Text className="text-primary-foreground font-bold text-[14.5px]">
                  {isSubmitting
                    ? 'Guardando...'
                    : editingEntry
                      ? 'Actualizar'
                      : 'Guardar'}
                </Text>
              </Pressable>
            </View>
          </View>

          {showDatePicker && (
            <CalendarPicker
              selectedDate={formDate}
              onSelectDate={setFormDate}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
