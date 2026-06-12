import { NextAuthOptions, DefaultSession, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { usersRepository } from "@/repositories";
import { PreacherType } from "@/domain/User";

// 1. Tipamos los datos que queremos en la sesión de forma global
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      phone: string;
      preacherType: PreacherType;
      monthlyGoal: number;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    name: string;
    phone: string;
    preacherType: PreacherType;
    monthlyGoal: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone: string;
    name: string;
    preacherType: PreacherType;
    monthlyGoal: number;
  }
}

export const authOptions: NextAuthOptions = {
  // El adapter no es necesario para flujo de Credentials con JWT
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Celular", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const rawPhone = credentials.identifier.trim();
        const phoneWithPrefix = rawPhone.startsWith("+51") ? rawPhone : `+51${rawPhone}`;

        const user = await usersRepository.findByPhone(phoneWithPrefix);

        if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
          // Retornamos todos los campos que queremos guardar en el token/sesión
          return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            preacherType: user.preacherType,
            monthlyGoal: user.monthlyGoal
          };
        }
        
        throw new Error("Credenciales inválidas.");
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Al iniciar sesión, guardamos todo en el token
        token.id = user.id;
        token.phone = user.phone;
        token.name = user.name;
        token.preacherType = user.preacherType;
        token.monthlyGoal = user.monthlyGoal;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Pasamos los datos del token a la sesión
        session.user.id = token.id;
        session.user.phone = token.phone;
        session.user.name = token.name;
        session.user.preacherType = token.preacherType;
        session.user.monthlyGoal = token.monthlyGoal;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
};

// 2. Método fácil para recuperar el usuario actual en Server Components/Actions
export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
};
