import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { configureCognito } from './lib/cognito';

// Configure AWS Amplify/Cognito if credentials are available
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const region = import.meta.env.VITE_COGNITO_REGION;

if (userPoolId && clientId && region) {
  configureCognito();
  console.log('✓ AWS Cognito configured successfully');
} else {
  console.log('⚠ AWS Cognito credentials not found. Running in local/mock mode.');
  console.log('  To enable Cognito, set these env variables:');
  console.log('  - VITE_COGNITO_USER_POOL_ID');
  console.log('  - VITE_COGNITO_CLIENT_ID');
  console.log('  - VITE_COGNITO_REGION');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
