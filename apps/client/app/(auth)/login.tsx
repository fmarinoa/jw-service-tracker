import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../../src/features/auth/useAuth';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, isLoading, error, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleLogin = async () => {
    setLocalError('');
    if (!phone || !password) {
      setLocalError('Por favor ingresa tus credenciales');
      return;
    }
    try {
      await login(phone, password);
      router.replace('/');
    } catch {
      // Catch error to prevent unhandled promise rejection
    }
  };

  const displayError = localError || error;

  return (
    <View className="flex-1 justify-center items-center p-6 bg-background">
      <View className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-lg">
        <Text className="text-4xl font-extrabold text-primary text-center mb-2">
          JW Tracker
        </Text>
        <Text className="text-muted-foreground text-center mb-8 font-medium">
          Tu informe de servicio, simple y elegante.
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-foreground font-bold mb-2">Celular</Text>
            <TextInput
              className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-base"
              placeholder="ej: 999888777"
              placeholderTextColor="#7b726c"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View className="mt-4">
            <Text className="text-foreground font-bold mb-2">Contraseña</Text>
            <TextInput
              className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-base"
              placeholder="••••••••"
              placeholderTextColor="#7b726c"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
          </View>

          {displayError && (
            <View className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4">
              <Text className="text-red-600 text-sm text-center font-semibold">
                {displayError}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className={`w-full h-12 bg-primary rounded-lg justify-center items-center mt-6 active:bg-primary/95 ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-primary-foreground font-bold text-base">
                Entrar
              </Text>
            )}
          </Pressable>
        </View>

        <View className="mt-6 flex-row justify-center items-center flex-wrap">
          <Text
            className="text-muted-foreground text-sm select-none"
            selectable={false}
          >
            ¿No tienes cuenta?{' '}
          </Text>
          <Pressable
            onPress={() => router.push('/register')}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text
              pointerEvents="none"
              className="text-primary font-bold text-sm select-none active:underline"
              selectable={false}
            >
              Regístrate aquí
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
