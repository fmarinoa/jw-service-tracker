import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

const INVITE_CODE_LENGTH = 8;

import {
  EyeIcon,
  LockIcon,
  PersonIcon,
  PhoneIcon,
  TicketIcon,
} from '../../src/features/auth/icons';
import { AuthApi } from '../../src/services/authApi';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [codeDigits, setCodeDigits] = useState<string[]>(
    Array(INVITE_CODE_LENGTH).fill(''),
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const codeInputRefs = useRef<Array<TextInput | null>>([]);
  const inviteCode = codeDigits.join('');

  const setCodeDigit = (index: number, raw: string) => {
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Pasting a full (or partial) code: distribute across cells starting here.
    if (clean.length > 1) {
      setCodeDigits((prev) => {
        const next = [...prev];
        let pos = index;
        for (const ch of clean) {
          if (pos >= INVITE_CODE_LENGTH) break;
          next[pos] = ch;
          pos += 1;
        }
        return next;
      });
      const focusIndex = Math.min(index + clean.length, INVITE_CODE_LENGTH - 1);
      codeInputRefs.current[focusIndex]?.focus();
      return;
    }

    setCodeDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (clean && index < INVITE_CODE_LENGTH - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
      setCodeDigits((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
    }
  };

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
      await AuthApi.register({
        name,
        phone,
        password,
        invitationCode: inviteCode.trim() || undefined,
      });
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
      <View className="w-full max-w-md bg-card border border-border p-8 rounded-3xl">
        <Text className="text-2xl font-extrabold text-foreground text-center mb-1.5">
          Crear cuenta
        </Text>
        <Text className="text-muted-foreground text-center mb-8 text-sm">
          Regístrate para empezar a registrar tu servicio.
        </Text>

        <View>
          <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
            Nombre
          </Text>
          <View className="flex-row items-center gap-2.5 px-3.5 bg-background border border-border rounded-xl mb-4">
            <PersonIcon />
            <TextInput
              className="flex-1 py-3 text-foreground text-[15px]"
              placeholder="Tu nombre completo"
              placeholderTextColor="#a8a099"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
            Celular
          </Text>
          <View className="flex-row items-center gap-2.5 px-3.5 bg-background border border-border rounded-xl">
            <PhoneIcon />
            <TextInput
              className="flex-1 py-3 text-foreground text-[15px]"
              placeholder="999 888 777"
              placeholderTextColor="#a8a099"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={9}
              autoCapitalize="none"
            />
          </View>
          <Text className="text-[10.5px] text-muted-foreground mt-1 mb-4">
            Se guardará como +51 {phone || '999888777'}
          </Text>

          <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
            Contraseña
          </Text>
          <View className="flex-row items-center gap-2.5 px-3.5 bg-background border border-border rounded-xl mb-4">
            <LockIcon />
            <TextInput
              className="flex-1 py-3 text-foreground text-[15px]"
              placeholder="Mínimo 6 caracteres"
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

          <View className="flex-row items-center gap-1.5 mb-1.5">
            <TicketIcon size={14} />
            <Text className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Código de invitación (opcional)
            </Text>
          </View>
          <View className="flex-row w-full gap-1.5">
            {codeDigits.map((digit, index) => (
              <View
                key={index}
                className={`flex-1 min-w-0 h-12 items-center justify-center bg-background border rounded-xl ${
                  digit ? 'border-primary' : 'border-border'
                }`}
              >
                <TextInput
                  ref={(el) => {
                    codeInputRefs.current[index] = el;
                  }}
                  value={digit}
                  onChangeText={(val) => setCodeDigit(index, val)}
                  onKeyPress={({ nativeEvent }) =>
                    handleCodeKeyPress(index, nativeEvent.key)
                  }
                  maxLength={INVITE_CODE_LENGTH}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  selectTextOnFocus
                  textAlign="center"
                  className="w-full text-center text-foreground font-extrabold text-base"
                />
              </View>
            ))}
          </View>
          <Text className="text-[10.5px] text-muted-foreground mt-1">
            Sin código, tu cuenta quedará pendiente de aprobación manual.
          </Text>

          {success && (
            <View className="bg-green-50 border border-green-200 p-3 rounded-xl mt-4">
              <Text className="text-green-700 text-sm text-center font-bold">
                ¡Registro exitoso! Redirigiendo...
              </Text>
            </View>
          )}

          {error ? (
            <View className="bg-red-50 border border-red-200 p-3 rounded-xl mt-4">
              <Text className="text-red-600 text-sm text-center font-semibold">
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleRegister}
            disabled={isLoading || success}
            className={`w-full py-4 bg-primary rounded-2xl justify-center items-center mt-5 active:bg-primary/90 ${
              isLoading || success ? 'opacity-50' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fdfbf7" />
            ) : (
              <Text className="text-primary-foreground font-bold text-[15.5px]">
                Registrarse
              </Text>
            )}
          </Pressable>
        </View>

        <View className="mt-5 flex-row justify-center items-center flex-wrap">
          <Text
            className="text-muted-foreground text-[13.5px] select-none"
            selectable={false}
          >
            ¿Ya tienes cuenta?{' '}
          </Text>
          <Pressable
            onPress={() => router.push('/login')}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text
              pointerEvents="none"
              className="text-primary font-bold text-[13.5px] select-none active:underline"
              selectable={false}
            >
              Inicia Sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
