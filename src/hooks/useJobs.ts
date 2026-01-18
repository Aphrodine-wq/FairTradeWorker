/**
 * useJobs - Job Management Hook
 *
 * Manages job operations and state
 * - Create jobs
 * - List/filter jobs
 * - Get job details
 * - Submit/manage bids
 * - Track job status
 *
 * Usage:
 * const { jobs, isLoading, error, createJob, submitBid, listJobs } = useJobs()
 */

import { useState, useCallback } from 'react'
import { apiClient } from '@/src/services/apiClient'
import type { Job, Bid } from '@/types'

export interface UseJobsReturn {
  jobs: Job[]
  bids: Bid[]
  selectedJob: Job | null
  isLoading: boolean
  error: string | null
  createJob: (data: {
    title: string
    description: string
    category: string
    location: string
    budget: number
    deadline: string
    images?: string[]
  }) => Promise<Job>
  getJob: (jobId: string) => Promise<Job>
  listJobs: (filters?: {
    category?: string
    location?: string
    minBudget?: number
    maxBudget?: number
    status?: string
    page?: number
    limit?: number
  }) => Promise<void>
  submitBid: (jobId: string, amount: number, timeline: string) => Promise<Bid>
  getBid: (bidId: string) => Promise<Bid>
  listBidsByJob: (jobId: string) => Promise<Bid[]>
  listBidsByContractor: (contractorId: string) => Promise<Bid[]>
  closeJob: (jobId: string) => Promise<void>
  selectJob: (job: Job | null) => void
  clearError: () => void
}

export const useJobs = (): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createJob = useCallback(
    async (data: {
      title: string
      description: string
      category: string
      location: string
      budget: number
      deadline: string
      images?: string[]
    }) => {
      setIsLoading(true)
      setError(null)

      try {
        const job = await apiClient.jobs.create(data)
        setJobs((prev) => [job, ...prev])
        return job as Job
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create job'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getJob = useCallback(async (jobId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const job = await apiClient.jobs.get(jobId)
      setSelectedJob(job as Job)
      return job as Job
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get job'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const listJobs = useCallback(
    async (filters?: {
      category?: string
      location?: string
      minBudget?: number
      maxBudget?: number
      status?: string
      page?: number
      limit?: number
    }) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await apiClient.jobs.list(filters)
        setJobs((result as any).jobs || result as Job[])
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load jobs'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const submitBid = useCallback(
    async (jobId: string, amount: number, timeline: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const bid = await apiClient.bids.create(jobId, amount, timeline)
        setBids((prev) => [bid, ...prev])
        return bid as Bid
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to submit bid'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getBid = useCallback(async (bidId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const bid = await apiClient.bids.get(bidId)
      return bid as Bid
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get bid'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const listBidsByJob = useCallback(async (jobId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const jobBids = await apiClient.bids.listByJob(jobId)
      setBids(jobBids as Bid[])
      return jobBids as Bid[]
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load bids'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const listBidsByContractor = useCallback(
    async (contractorId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const contractorBids = await apiClient.bids.listByContractor(contractorId)
        setBids(contractorBids as Bid[])
        return contractorBids as Bid[]
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load bids'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const closeJob = useCallback(async (jobId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await apiClient.jobs.close(jobId)
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'CLOSED' } : j)))
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to close job'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectJob = useCallback((job: Job | null) => {
    setSelectedJob(job)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    jobs,
    bids,
    selectedJob,
    isLoading,
    error,
    createJob,
    getJob,
    listJobs,
    submitBid,
    getBid,
    listBidsByJob,
    listBidsByContractor,
    closeJob,
    selectJob,
    clearError,
  }
}
