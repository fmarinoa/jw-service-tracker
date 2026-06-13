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
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
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
            name: user.name
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
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Pasamos los datos del token a la sesión
        session.user.id = token.id;
        session.user.name = token.name;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
};

export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
};
