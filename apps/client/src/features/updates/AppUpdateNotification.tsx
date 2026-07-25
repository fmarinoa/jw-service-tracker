import type { CheckUpdateResponse } from '@jw-tracker/shared';
import React, { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReleasesApi } from '../../services/releasesApi';

export function AppUpdateNotification() {
  const insets = useSafeAreaInsets();
  const [updateInfo, setUpdateInfo] = useState<CheckUpdateResponse | null>(
    null,
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo en Android (y en __DEV__ para pruebas)
    if (Platform.OS !== 'android' && !__DEV__) return;

    let isMounted = true;

    // Se ejecuta silenciosamente en segundo plano 1.5s después de cargar el panel
    const timer = setTimeout(async () => {
      try {
        const res = await ReleasesApi.checkUpdate();
        if (isMounted && res.hasUpdate && res.downloadUrl) {
          setUpdateInfo(res);
          setIsVisible(true);
        }
      } catch (error) {
        console.warn('Verificación discreta de actualización falló:', error);
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible || !updateInfo || (Platform.OS !== 'android' && !__DEV__)) {
    return null;
  }

  const handleUpdate = () => {
    if (updateInfo.downloadUrl) {
      Linking.openURL(updateInfo.downloadUrl);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom + 8, 16) }}
      className="absolute bottom-0 left-0 right-0 z-50 px-4 pt-2"
    >
      <View className="bg-card border border-border rounded-2xl p-3.5 shadow-lg flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3 gap-3">
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
            <Text className="text-sm">🚀</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-foreground">
              Actualización disponible
            </Text>
            <Text className="text-xs text-muted-foreground">
              Versión {updateInfo.latestVersion}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={handleUpdate}
            className="px-3.5 py-1.5 bg-primary rounded-xl active:bg-primary/90 shadow-sm"
          >
            <Text className="text-primary-foreground font-bold text-xs">
              Actualizar
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDismiss}
            className="w-7 h-7 rounded-xl items-center justify-center bg-muted active:bg-muted/80 ml-1"
          >
            <Text className="text-xs font-bold text-muted-foreground">✕</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
