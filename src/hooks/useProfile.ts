/**
 * useProfile - User Profile Hook
 *
 * Manages user profile operations
 * - Get/update user profile
 * - Contractor specializations
 * - User preferences
 * - Business profile setup
 * - Onboarding status
 * - Contractor listings
 *
 * Usage:
 * const { profile, isLoading, updateProfile, setSpecializations } = useProfile(userId)
 */

import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/src/services/apiClient'
import type { UserProfile } from '@/types'

export interface UseProfileReturn {
  profile: UserProfile | null
  contractors: UserProfile[]
  onboardingStatus: {
    step: number
    status: string
    completed: boolean
    pending: string[]
  } | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  loadProfile: (userId: string) => Promise<void>
  updateProfile: (data: Record<string, unknown>) => Promise<void>
  setSpecializations: (tradeTypes: string[]) => Promise<void>
  updatePreferences: (preferences: Record<string, unknown>) => Promise<void>
  setupBusinessProfile: (businessProfile: Record<string, unknown>) => Promise<void>
  getOnboardingStatus: (contractorId: string) => Promise<void>
  listContractors: (filters?: Record<string, unknown>) => Promise<void>
  clearError: () => void
}

export const useProfile = (userId?: string): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [contractors, setContractors] = useState<UserProfile[]>([])
  const [onboardingStatus, setOnboardingStatus] = useState<{
    step: number
    status: string
    completed: boolean
    pending: string[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load profile on mount if userId provided
  useEffect(() => {
    if (userId) {
      loadProfile(userId)
    }
  }, [userId])

  const loadProfile = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const userData = await apiClient.users.getProfile(id)
      setProfile(userData as UserProfile)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load profile'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: Record<string, unknown>) => {
    if (!profile) return

    setIsSaving(true)
    setError(null)

    try {
      const updated = await apiClient.users.updateProfile(profile.id, data)
      setProfile(updated as UserProfile)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }, [profile])

  const setSpecializations = useCallback(async (tradeTypes: string[]) => {
    if (!profile || profile.role !== 'CONTRACTOR') return

    setIsSaving(true)
    setError(null)

    try {
      await apiClient.users.setSpecializations(profile.id, tradeTypes)
      setProfile((prev) =>
        prev ? { ...prev, specializations: tradeTypes } : null
      )
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to set specializations'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }, [profile])

  const updatePreferences = useCallback(
    async (preferences: Record<string, unknown>) => {
      if (!profile) return

      setIsSaving(true)
      setError(null)

      try {
        await apiClient.users.updatePreferences(profile.id, preferences)
        setProfile((prev) =>
          prev ? { ...prev, preferences } : null
        )
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update preferences'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsSaving(false)
      }
    },
    [profile]
  )

  const setupBusinessProfile = useCallback(
    async (businessProfile: Record<string, unknown>) => {
      if (!profile || profile.role !== 'CONTRACTOR') return

      setIsSaving(true)
      setError(null)

      try {
        await apiClient.users.setupBusinessProfile(profile.id, businessProfile)
        setProfile((prev) =>
          prev ? { ...prev, businessProfile } : null
        )
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to setup business profile'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsSaving(false)
      }
    },
    [profile]
  )

  const getOnboardingStatus = useCallback(async (contractorId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const status = await apiClient.users.getOnboardingStatus(contractorId)
      setOnboardingStatus(status as any)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get onboarding status'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const listContractors = useCallback(
    async (filters?: Record<string, unknown>) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await apiClient.users.listContractors(filters)
        setContractors((result as any).contractors || (result as UserProfile[]))
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load contractors'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    profile,
    contractors,
    onboardingStatus,
    isLoading,
    isSaving,
    error,
    loadProfile,
    updateProfile,
    setSpecializations,
    updatePreferences,
    setupBusinessProfile,
    getOnboardingStatus,
    listContractors,
    clearError,
  }
}
