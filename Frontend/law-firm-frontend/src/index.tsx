// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Ensure localStorage is available before rendering
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Clear any invalid auth state on hard reload (optional)
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

if (accessToken && refreshToken) {
  // Tokens exist, App will validate them
  console.log('Existing tokens found, validating...');
} else {
  // Clear any stale auth storage
  localStorage.removeItem('auth-storage');
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);