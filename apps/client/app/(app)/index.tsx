import { Redirect } from 'expo-router';
import React from 'react';

export default function AppIndexRedirect() {
  return <Redirect href="/home" />;
}
