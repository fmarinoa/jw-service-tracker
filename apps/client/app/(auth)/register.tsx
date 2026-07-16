import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuthApi } from '../../src/services/authApi';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setError('');
    setSuccess(false);

    if (!name || !phone || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (phone.length !== 9 || !phone.startsWith('9')) {
      setError('El celular debe tener 9 dígitos y empezar con 9.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await AuthApi.register({ name, phone, password });
      setSuccess(true);
      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-background">
      <View className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-lg">
        <Text className="text-4xl font-extrabold text-primary text-center mb-2">
          Crear Cuenta
        </Text>
        <Text className="text-muted-foreground text-center mb-8 font-medium">
          Regístrate para empezar a trackear tu servicio.
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-foreground font-bold mb-2">Nombre</Text>
            <TextInput
              className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-base"
              placeholder="Tu nombre completo"
              placeholderTextColor="#7b726c"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View className="mt-4">
            <Text className="text-foreground font-bold mb-2">Celular</Text>
            <TextInput
              className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-base"
              placeholder="ej: 999888777"
              placeholderTextColor="#7b726c"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={9}
              autoCapitalize="none"
            />
            <Text className="text-[10px] text-muted-foreground mt-1">
              Ingresa tus 9 dígitos (se guardará con +51).
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-foreground font-bold mb-2">Contraseña</Text>
            <TextInput
              className="w-full bg-background border border-border text-foreground rounded-lg p-3 text-base"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#7b726c"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
          </View>

          {success && (
            <View className="bg-green-50 border border-green-200 p-3 rounded-lg mt-4">
              <Text className="text-green-700 text-sm text-center font-bold">
                ¡Registro exitoso! Redirigiendo...
              </Text>
            </View>
          )}

          {error && (
            <View className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4">
              <Text className="text-red-600 text-sm text-center font-semibold">
                {error}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleRegister}
            disabled={isLoading || success}
            className={`w-full h-12 bg-primary rounded-lg justify-center items-center mt-6 active:bg-primary/95 ${
              isLoading || success ? 'opacity-50' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-primary-foreground font-bold text-base">
                Registrarse
              </Text>
            )}
          </Pressable>
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-muted-foreground text-sm text-center">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login">
              <Text className="text-primary font-bold text-sm active:underline">
                Inicia Sesión
              </Text>
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}
