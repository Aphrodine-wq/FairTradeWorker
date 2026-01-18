/**
 * useContracts - Contract Management Hook
 *
 * Manages contract lifecycle and operations
 * - Create contracts
 * - Track contract status
 * - Manage completions
 * - Handle disputes
 * - Track payments
 *
 * Usage:
 * const { contracts, submitCompletion, dispute, resolveDispute } = useContracts()
 */

import { useState, useCallback } from 'react'
import { apiClient } from '@/src/services/apiClient'
import type { BidContract, JobCompletion, Dispute } from '@/types'

export interface UseContractsReturn {
  contracts: BidContract[]
  completions: JobCompletion[]
  disputes: Dispute[]
  selectedContract: BidContract | null
  isLoading: boolean
  error: string | null
  createContract: (data: {
    jobId: string
    contractorId: string
    bidAmount: number
    timeline: string
  }) => Promise<BidContract>
  getContract: (contractId: string) => Promise<BidContract>
  listByJob: (jobId: string) => Promise<BidContract[]>
  updateContract: (contractId: string, data: Record<string, unknown>) => Promise<BidContract>
  acceptBid: (contractId: string) => Promise<void>
  rejectBid: (contractId: string, reason: string) => Promise<void>
  submitCompletion: (data: {
    contractId: string
    photos: string[]
    video?: string
    notes?: string
    geolocation?: { latitude: number; longitude: number }
  }) => Promise<JobCompletion>
  approveCompletion: (completionId: string, rating: number, feedback: string) => Promise<void>
  disputeCompletion: (completionId: string, reason: string, evidence?: string[]) => Promise<Dispute>
  getDispute: (disputeId: string) => Promise<Dispute>
  submitDisputeResponse: (disputeId: string, response: string, evidence?: string[]) => Promise<void>
  resolveDispute: (
    disputeId: string,
    resolution: 'REFUND' | 'PARTIAL_REFUND' | 'REWORK' | 'ARBITRATION',
    amount?: number
  ) => Promise<void>
  selectContract: (contract: BidContract | null) => void
  clearError: () => void
}

export const useContracts = (): UseContractsReturn => {
  const [contracts, setContracts] = useState<BidContract[]>([])
  const [completions, setCompletions] = useState<JobCompletion[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [selectedContract, setSelectedContract] = useState<BidContract | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createContract = useCallback(
    async (data: {
      jobId: string
      contractorId: string
      bidAmount: number
      timeline: string
    }) => {
      setIsLoading(true)
      setError(null)

      try {
        const contract = await apiClient.contracts.create(data)
        setContracts((prev) => [contract, ...prev])
        return contract as BidContract
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create contract'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getContract = useCallback(async (contractId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const contract = await apiClient.contracts.get(contractId)
      setSelectedContract(contract as BidContract)
      return contract as BidContract
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get contract'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const listByJob = useCallback(async (jobId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const jobContracts = await apiClient.contracts.listByJob(jobId)
      setContracts(jobContracts as BidContract[])
      return jobContracts as BidContract[]
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load contracts'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateContract = useCallback(
    async (contractId: string, data: Record<string, unknown>) => {
      setIsLoading(true)
      setError(null)

      try {
        const contract = await apiClient.contracts.update(contractId, data)
        setContracts((prev) =>
          prev.map((c) => (c.id === contractId ? (contract as BidContract) : c))
        )
        if (selectedContract?.id === contractId) {
          setSelectedContract(contract as BidContract)
        }
        return contract as BidContract
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update contract'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedContract]
  )

  const acceptBid = useCallback(async (contractId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await apiClient.contracts.acceptBid(contractId)
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId ? { ...c, status: 'PENDING_ACCEPTANCE' } : c
        )
      )
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to accept bid'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const rejectBid = useCallback(async (contractId: string, reason: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await apiClient.contracts.rejectBid(contractId, reason)
      setContracts((prev) => prev.filter((c) => c.id !== contractId))
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reject bid'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitCompletion = useCallback(
    async (data: {
      contractId: string
      photos: string[]
      video?: string
      notes?: string
      geolocation?: { latitude: number; longitude: number }
    }) => {
      setIsLoading(true)
      setError(null)

      try {
        const completion = await apiClient.completions.submit(data)
        setCompletions((prev) => [completion, ...prev])
        return completion as JobCompletion
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to submit completion'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const approveCompletion = useCallback(
    async (completionId: string, rating: number, feedback: string) => {
      setIsLoading(true)
      setError(null)

      try {
        await apiClient.completions.approve(completionId, rating, feedback)
        setCompletions((prev) =>
          prev.map((c) => (c.id === completionId ? { ...c, status: 'APPROVED' } : c))
        )
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to approve completion'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const disputeCompletion = useCallback(
    async (completionId: string, reason: string, evidence?: string[]) => {
      setIsLoading(true)
      setError(null)

      try {
        const dispute = await apiClient.completions.dispute(
          completionId,
          reason,
          evidence
        )
        setDisputes((prev) => [dispute, ...prev])
        setCompletions((prev) =>
          prev.map((c) => (c.id === completionId ? { ...c, status: 'DISPUTED' } : c))
        )
        return dispute as Dispute
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to dispute completion'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getDispute = useCallback(async (disputeId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const dispute = await apiClient.disputes.get(disputeId)
      return dispute as Dispute
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get dispute'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitDisputeResponse = useCallback(
    async (disputeId: string, response: string, evidence?: string[]) => {
      setIsLoading(true)
      setError(null)

      try {
        await apiClient.disputes.submitResponse(disputeId, response, evidence)
        setDisputes((prev) =>
          prev.map((d) =>
            d.id === disputeId ? { ...d, contractorResponse: response } : d
          )
        )
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to submit response'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const resolveDispute = useCallback(
    async (
      disputeId: string,
      resolution: 'REFUND' | 'PARTIAL_REFUND' | 'REWORK' | 'ARBITRATION',
      amount?: number
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        await apiClient.disputes.resolve(disputeId, resolution, amount)
        setDisputes((prev) =>
          prev.map((d) =>
            d.id === disputeId ? { ...d, resolution, status: 'RESOLVED' } : d
          )
        )
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to resolve dispute'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const selectContract = useCallback((contract: BidContract | null) => {
    setSelectedContract(contract)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    contracts,
    completions,
    disputes,
    selectedContract,
    isLoading,
    error,
    createContract,
    getContract,
    listByJob,
    updateContract,
    acceptBid,
    rejectBid,
    submitCompletion,
    approveCompletion,
    disputeCompletion,
    getDispute,
    submitDisputeResponse,
    resolveDispute,
    selectContract,
    clearError,
  }
}
