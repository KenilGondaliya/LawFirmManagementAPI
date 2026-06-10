import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

if (accessToken && refreshToken) {
  console.log('Existing tokens found, validating...');
} else {
  localStorage.removeItem('auth-storage');
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);