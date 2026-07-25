import { formatLongDate, SessionType } from '@jw-tracker/shared';
import { DateTime } from 'luxon';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useDashboard } from '../DashboardProvider';
import { CategoryIcon } from './icons';

const TYPE_LABELS: Record<SessionType, string> = {
  house_to_house: 'Casa en casa',
  revisits: 'Revisitas',
  bible_study: 'Estudio Bíblico',
  other: 'Otro',
};

interface RecentActivityCardProps {
  title?: string;
}

export default function RecentActivityCard({
  title = 'Actividad Reciente',
}: RecentActivityCardProps) {
  const {
    entries,
    isEntriesLoading,
    handleEdit,
    openDeleteModal,
    page,
    totalPages,
    fetchDashboardData,
  } = useDashboard();

  const formatLongDateLabel = (millis: number) => {
    const dt = DateTime.fromMillis(millis);
    const formatted = formatLongDate(dt);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <View className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <Text className="text-base font-bold text-foreground mb-4">{title}</Text>

      {isEntriesLoading ? (
        <View className="py-10 items-center justify-center">
          <ActivityIndicator color="#b86a3d" />
          <Text className="text-muted-foreground text-xs mt-2">
            Cargando registros...
          </Text>
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
            <View
              key={entry.id}
              className="py-4 flex-row justify-between items-start gap-3"
            >
              <View className="flex-row flex-1 gap-3 min-w-0">
                <View className="w-9 h-9 rounded-[10px] bg-muted items-center justify-center flex-shrink-0">
                  <CategoryIcon type={entry.type} size={17} />
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center flex-wrap gap-1.5">
                    <Text className="font-bold text-foreground text-[13.5px]">
                      {formatLongDateLabel(entry.preachingDate)}
                    </Text>
                    {entry.isOffline && (
                      <View className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded">
                        <Text className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                          Pendiente
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {entry.hours}h {entry.minutes}m • {TYPE_LABELS[entry.type]}
                  </Text>
                  {entry.notes ? (
                    <Text className="text-xs text-muted-foreground mt-1 italic">
                      "{entry.notes}"
                    </Text>
                  ) : null}
                </View>
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
          ))}

          {/* PAGINATION */}
          {totalPages > 1 ? (
            <View className="flex-row items-center justify-between pt-4 mt-2">
              <Pressable
                onPress={() => fetchDashboardData(page - 1)}
                disabled={page === 1}
                className={`px-3 py-1.5 bg-muted border border-border rounded-lg active:bg-muted/80 ${
                  page === 1 ? 'opacity-50' : ''
                }`}
              >
                <Text className="text-foreground text-xs font-bold">
                  ◀ Anterior
                </Text>
              </Pressable>
              <Text className="text-xs text-muted-foreground font-semibold">
                Página {page} de {totalPages}
              </Text>
              <Pressable
                onPress={() => fetchDashboardData(page + 1)}
                disabled={page === totalPages}
                className={`px-3 py-1.5 bg-muted border border-border rounded-lg active:bg-muted/80 ${
                  page === totalPages ? 'opacity-50' : ''
                }`}
              >
                <Text className="text-foreground text-xs font-bold">
                  Siguiente ▶
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
