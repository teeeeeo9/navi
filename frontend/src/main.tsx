import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/index.css'
import { logApiConfiguration } from './utils/debugUtils.ts'
import axios from 'axios'

// Set axios baseURL from environment variable with fallback
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
axios.defaults.baseURL = apiBaseUrl;
console.log('Setting axios.defaults.baseURL to:', axios.defaults.baseURL);

// Add request interceptor to include ngrok-skip-browser-warning header
axios.interceptors.request.use(config => {
  config.headers['ngrok-skip-browser-warning'] = '69420';
  return config;
});

// Log API configuration on startup to help debug API URL issues
logApiConfiguration();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
) 