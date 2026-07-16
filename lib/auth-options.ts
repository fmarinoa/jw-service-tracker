import { DefaultSession, getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { AuthClient } from "./auth-client";

// 1. Tipamos los datos que queremos en la sesión de forma global
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
    } & DefaultSession["user"];
    accessToken?: string;
    error?: string;
  }

  interface User {
    id: string;
    name: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Celular", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        try {
          const loginRes = await AuthClient.login({
            phone: credentials.identifier.trim(),
            password: credentials.password,
          });

          return {
            id: loginRes.user.id,
            name: loginRes.user.name,
            accessToken: loginRes.accessToken,
            refreshToken: loginRes.refreshToken,
            expiresAt: Date.now() + loginRes.expiresIn * 1000,
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Credenciales inválidas.";
          throw new Error(message);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresAt = user.expiresAt;
      }

      // Check if access token is expired (or close to expiring, e.g. within 60s)
      if (Date.now() < token.expiresAt - 60000) {
        return token;
      }

      // Access token expired, try to refresh it
      try {
        const refreshRes = await AuthClient.refresh(token.refreshToken);
        return {
          ...token,
          accessToken: refreshRes.accessToken,
          refreshToken: refreshRes.refreshToken,
          expiresAt: Date.now() + refreshRes.expiresIn * 1000,
        };
      } catch (error) {
        console.error("Error refreshing token:", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.refreshToken) {
        try {
          await AuthClient.logout(token.refreshToken);
        } catch (error) {
          console.error("Failed to revoke session on logout", error);
        }
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
};
