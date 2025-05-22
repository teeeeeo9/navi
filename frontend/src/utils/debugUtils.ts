// Debug utilities for logging environment and API configuration
import axios from 'axios';

/**
 * Logs information about the API configuration and environment
 * to help debug issues with API connections
 */
export const logApiConfiguration = () => {
  console.log('=== API Configuration Debug Info ===');
  console.log('Vite Environment Variables:');
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('Environment mode:', import.meta.env.MODE);
  console.log('Is production:', import.meta.env.PROD);
  
  // Log axios defaults
  console.log('Axios default baseURL:', axios.defaults.baseURL);
  console.log('Current axios headers:', axios.defaults.headers.common);
  
  // Current proxy configuration in use
  console.log('Current API calls will be proxied through Vite dev server if running in development');
  console.log('=== End Debug Info ===');
}; 