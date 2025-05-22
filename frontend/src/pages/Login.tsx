import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import logoImage from '@/assets/logo.png'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    try {
      setIsSubmitting(true)
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      // Error is handled in the auth context
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md rounded-2xl p-8 shadow-2xl"
      >
        <div className="mb-6 text-center">
          <Link to="/" className="inline-block">
            <img src={logoImage} alt="Navi Logo" className="mx-auto mb-2 h-12 w-auto" />
            <h1 className="mb-1 text-3xl font-bold text-white">Navi</h1>
          </Link>
          <p className="text-md text-dark-100">Goal Setting & Strategic Planning</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded bg-red-500/20 p-3 text-red-200"
          >
            <p>{error}</p>
            <button
              onClick={clearError}
              className="mt-1 text-sm text-red-300 hover:text-white"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-dark-100">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full rounded-lg border-0 bg-dark-700/50 p-3 text-white placeholder-dark-300 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-dark-100">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border-0 bg-dark-700/50 p-3 text-white placeholder-dark-300 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 p-3 font-bold text-white shadow-lg transition-all hover:shadow-primary-500/30"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-dark-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-400 hover:text-primary-300">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login 