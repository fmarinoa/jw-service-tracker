import { getSpanishMonthName } from '@jw-tracker/shared';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface CalendarPickerProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export default function CalendarPicker({
  selectedDate,
  onSelectDate,
  onClose,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState<DateTime>(() => {
    const initial = DateTime.fromISO(selectedDate);
    return initial.isValid
      ? initial.startOf('month')
      : DateTime.now().setZone('America/Lima').startOf('month');
  });

  useEffect(() => {
    const initial = DateTime.fromISO(selectedDate);
    if (initial.isValid) {
      setCurrentMonth(initial.startOf('month'));
    } else {
      setCurrentMonth(DateTime.now().setZone('America/Lima').startOf('month'));
    }
  }, [selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.minus({ months: 1 }));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.plus({ months: 1 }));
  };

  const handleSelectDay = (day: DateTime) => {
    onSelectDate(day.toISODate()!);
    onClose();
  };

  const handleToday = () => {
    const today = DateTime.now().setZone('America/Lima');
    onSelectDate(today.toISODate()!);
    onClose();
  };

  // Calendar logic
  const firstDayOfMonth = currentMonth.startOf('month');
  const daysInMonth = firstDayOfMonth.daysInMonth || 30;
  const firstDayWeekday = firstDayOfMonth.weekday; // 1 = Mon, 7 = Sun
  const startOffset = firstDayWeekday === 7 ? 0 : firstDayWeekday;

  const prevMonth = currentMonth.minus({ months: 1 });
  const prevMonthDays = prevMonth.daysInMonth || 30;

  const days: { date: DateTime; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    days.push({
      date: prevMonth.set({ day }),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: currentMonth.set({ day: i }),
      isCurrentMonth: true,
    });
  }

  // Next month padding to complete 6 rows (42 cells)
  const nextMonth = currentMonth.plus({ months: 1 });
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: nextMonth.set({ day: i }),
      isCurrentMonth: false,
    });
  }

  // Fix Hermes / iOS missing locale data by using a robust Spanish names helper
  const monthName = getSpanishMonthName(currentMonth.month);
  const capitalizedMonthLabel = `${monthName} ${currentMonth.year}`;

  const todayStr = DateTime.now().setZone('America/Lima').toISODate();

  return (
    <View className="absolute inset-0 bg-black/60 justify-center items-center p-4 z-50">
      <View className="bg-card border border-border rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
        {/* HEADER */}
        <View className="flex-row justify-between items-center pb-2">
          <Pressable
            onPress={handlePrevMonth}
            className="p-2 bg-muted rounded-lg active:bg-muted/80"
          >
            <Text className="text-foreground font-bold">◀</Text>
          </Pressable>
          <Text className="text-base font-bold text-foreground">
            {capitalizedMonthLabel}
          </Text>
          <Pressable
            onPress={handleNextMonth}
            className="p-2 bg-muted rounded-lg active:bg-muted/80"
          >
            <Text className="text-foreground font-bold">▶</Text>
          </Pressable>
        </View>

        {/* WEEKDAYS ROW */}
        <View className="flex-row justify-between border-b border-border pb-1">
          {WEEKDAYS.map((day, idx) => (
            <View key={idx} className="w-[14.28%] items-center">
              <Text className="text-xs font-bold text-muted-foreground font-semibold">
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* DAYS GRID */}
        <View className="flex-row flex-wrap">
          {days.map(({ date, isCurrentMonth }, idx) => {
            const dateStr = date.toISODate()!;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;

            return (
              <View
                key={idx}
                className="w-[14.28%] aspect-square items-center justify-center p-0.5"
              >
                <Pressable
                  onPress={() => handleSelectDay(date)}
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isSelected
                      ? 'bg-primary'
                      : isToday
                        ? 'border border-primary bg-primary/5'
                        : 'active:bg-muted'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected
                        ? 'text-primary-foreground font-bold'
                        : isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground/30'
                    }`}
                  >
                    {date.day}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* FOOTER ACTIONS */}
        <View className="flex-row space-x-3 pt-2 border-t border-border">
          <Pressable
            onPress={handleToday}
            className="flex-1 py-2.5 bg-muted rounded-xl items-center active:bg-muted/80"
          >
            <Text className="text-foreground font-bold text-xs">Hoy</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            className="flex-1 py-2.5 bg-primary rounded-xl items-center active:bg-primary/90"
          >
            <Text className="text-primary-foreground font-bold text-xs">
              Cerrar
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
