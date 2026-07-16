import "../src/global.css";

import { Slot } from "expo-router";
import React from "react";
import { LogBox, Platform } from "react-native";

import { AuthProvider } from "../src/features/auth/AuthProvider";

if (Platform.OS === "web") {
  LogBox.ignoreAllLogs();
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
