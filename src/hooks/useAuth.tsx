/**
 * useAuth - Authentication Hook
 *
 * Manages user authentication state and provides auth methods
 * - Login/logout
 * - User registration
 * - Token management
 * - Auth state tracking
 *
 * Usage:
 * const { user, isLoading, error, login, logout, register } = useAuth()
 */

import { useState, useCallback, useEffect, useContext, createContext, ReactNode } from 'react'
import { apiClient } from '@/src/services/apiClient'
import type { User } from '@/types'

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: {
    email: string
    phone: string
    password: string
    firstName: string
    lastName: string
    role: 'HOMEOWNER' | 'CONTRACTOR'
  }) => Promise<void>
  verifyPhone: (userId: string, otp: string) => Promise<void>
  verifyEmail: (userId: string, token: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  clearError: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * AuthProvider Component
 * Wrap your app with this to provide authentication context
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthLogic()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

/**
 * useAuth Hook
 * Use this in any component to access authentication state and methods
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Internal hook containing authentication logic
 */
function useAuthLogic(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user from API on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!apiClient.isAuthenticated()) {
          setIsLoading(false)
          return
        }

        const userId = apiClient.getCurrentUser()
        if (userId) {
          const userData = await apiClient.users.getProfile(userId)
          setUser(userData as User)
        }
      } catch (err) {
        console.error('Failed to load user:', err)
        apiClient.clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await apiClient.auth.login({ email, password })
      setUser(result.user as User)
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (user) {
        await apiClient.auth.logout(user.id)
      }
      setUser(null)
    } catch (err: any) {
      console.error('Logout error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const register = useCallback(
    async (data: {
      email: string
      phone: string
      password: string
      firstName: string
      lastName: string
      role: 'HOMEOWNER' | 'CONTRACTOR'
    }) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await apiClient.auth.register(data)
        setUser(result.user as User)
      } catch (err: any) {
        const errorMessage = err.message || 'Registration failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const verifyPhone = useCallback(
    async (userId: string, otp: string) => {
      setError(null)

      try {
        await apiClient.auth.verifyPhone(userId, otp)
      } catch (err: any) {
        const errorMessage = err.message || 'Phone verification failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const verifyEmail = useCallback(
    async (userId: string, token: string) => {
      setError(null)

      try {
        await apiClient.auth.verifyEmail(userId, token)
      } catch (err: any) {
        const errorMessage = err.message || 'Email verification failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const requestPasswordReset = useCallback(async (email: string) => {
    setError(null)

    try {
      await apiClient.auth.requestPasswordReset(email)
    } catch (err: any) {
      const errorMessage = err.message || 'Password reset request failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      setError(null)

      try {
        await apiClient.auth.resetPassword(token, newPassword)
      } catch (err: any) {
        const errorMessage = err.message || 'Password reset failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      if (user) {
        const userData = await apiClient.users.getProfile(user.id)
        setUser(userData as User)
      }
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }, [user])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    register,
    verifyPhone,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    clearError,
    refreshUser,
  }
}
