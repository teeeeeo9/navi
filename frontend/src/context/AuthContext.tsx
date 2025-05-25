import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

// Types
interface UserPreferences {
  reminder_frequency: string;
  reminder_day: number | null;
  reminder_time: string;
  time_zone: string;
  notification_channels: string;
  character_preference: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  preferences?: UserPreferences;
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
  clearError: () => {},
})

// Auth Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (token) {
      // Configure axios to use the token for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Fetch user profile
      fetchUserProfile()
    } else {
      setIsLoading(false)
    }
  }, [])

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    console.log('=== Fetching User Profile ===');
    console.log('Current axios defaults:', axios.defaults);
    console.log('Making request to /api/auth/profile');
    try {
      console.log('Request URL:', '/api/auth/profile');
      const { data } = await axios.get('/api/auth/profile');
      console.log('Profile data received:', data);
      setUser(data.user)
      setIsAuthenticated(true)
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      console.error('Error details:', err.response?.data);
      console.error('Request URL that failed:', err.config?.url);
      console.error('Full request that failed:', err.config);
      
      // If token is invalid, clear it
      localStorage.removeItem('token')
      axios.defaults.headers.common['Authorization'] = ''
      setError('Session expired. Please login again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data } = await axios.post('/api/auth/login', { username, password })
      
      // Save token to localStorage
      localStorage.setItem('token', data.access_token)
      
      // Configure axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
      
      // Set user data
      setUser(data.user)
      setIsAuthenticated(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data } = await axios.post('/api/auth/register', { username, email, password })
      
      // Save token to localStorage
      localStorage.setItem('token', data.access_token)
      
      // Configure axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
      
      // Set user data
      setUser(data.user)
      setIsAuthenticated(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    axios.defaults.headers.common['Authorization'] = ''
    setUser(null)
    setIsAuthenticated(false)
  }

  // Clear error function
  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext) 