import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { EyeIcon, LockIcon, PhoneIcon } from '../../src/features/auth/icons';
import { useAuth } from '../../src/features/auth/useAuth';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <View className="w-full max-w-md bg-card border border-border p-8 rounded-3xl">
        <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center self-center mb-4">
          <Text className="text-primary-foreground font-extrabold text-[22px]">
            JW
          </Text>
        </View>
        <Text className="text-[26px] font-extrabold text-foreground text-center mb-1.5">
          JW Reporta
        </Text>
        <Text className="text-muted-foreground text-center mb-8 text-sm">
          Tu informe de servicio, simple y claro.
        </Text>

        <View>
          <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
            Celular
          </Text>
          <View className="flex-row items-center gap-2.5 px-3.5 bg-background border border-border rounded-xl mb-4">
            <PhoneIcon />
            <TextInput
              className="flex-1 py-3 text-foreground text-[15px]"
              placeholder="999 888 777"
              placeholderTextColor="#a8a099"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              maxLength={9}
            />
          </View>

          <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
            Contraseña
          </Text>
          <View className="flex-row items-center gap-2.5 px-3.5 bg-background border border-border rounded-xl">
            <LockIcon />
            <TextInput
              className="flex-1 py-3 text-foreground text-[15px]"
              placeholder="••••••••"
              placeholderTextColor="#a8a099"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              className="p-1"
            >
              <EyeIcon />
            </Pressable>
          </View>

          {displayError && (
            <View className="bg-red-50 border border-red-200 p-3 rounded-xl mt-4">
              <Text className="text-red-600 text-sm text-center font-semibold">
                {displayError}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className={`w-full py-4 bg-primary rounded-2xl justify-center items-center mt-5 active:bg-primary/90 ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fdfbf7" />
            ) : (
              <Text className="text-primary-foreground font-bold text-[15.5px]">
                Entrar
              </Text>
            )}
          </Pressable>
        </View>

        <View className="mt-5 flex-row justify-center items-center flex-wrap">
          <Text
            className="text-muted-foreground text-[13.5px] select-none"
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
              className="text-primary font-bold text-[13.5px] select-none active:underline"
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
