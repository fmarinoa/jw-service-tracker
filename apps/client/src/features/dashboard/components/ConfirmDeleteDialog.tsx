import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { useDashboard } from '../DashboardProvider';

export default function ConfirmDeleteDialog() {
  const { showDeleteModal, setShowDeleteModal, isDeleting, handleDelete } =
    useDashboard();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDeleteModal}
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/60 p-4">
        <View className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4">
          <Text className="text-lg font-bold text-foreground">
            ¿Eliminar registro?
          </Text>
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Esta acción no se puede deshacer. El registro de predicación se
            borrará permanentemente.
          </Text>
          <View className="flex-row space-x-3 pt-2">
            <Pressable
              onPress={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="flex-1 py-2.5 bg-muted border border-border rounded-xl items-center active:bg-muted/80"
            >
              <Text className="text-foreground font-semibold text-sm">
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 bg-red-600 rounded-xl items-center active:bg-red-700"
            >
              <Text className="text-white font-bold text-sm">
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
