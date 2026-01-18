/**
 * useFileUpload - File Upload Hook
 *
 * Manages file uploads with progress tracking
 * - Single/multiple file uploads
 * - Progress tracking
 * - Error handling
 * - Cloudinary integration
 *
 * Usage:
 * const { upload, uploadMultiple, isLoading, progress, error } = useFileUpload()
 */

import { useState, useCallback } from 'react'
import { fileUploadService, UploadResult, UploadProgress, UploadOptions } from '@/src/services/fileUploadService'

export interface UseFileUploadReturn {
  isLoading: boolean
  progress: UploadProgress | null
  error: string | null
  uploadedFiles: UploadResult[]
  uploadImage: (file: File, options?: UploadOptions) => Promise<UploadResult>
  uploadVideo: (file: File, options?: UploadOptions) => Promise<UploadResult>
  uploadMultipleImages: (
    files: File[],
    options?: UploadOptions
  ) => Promise<UploadResult[]>
  uploadImageWithProgress: (
    file: File,
    options?: UploadOptions,
    onProgress?: (progress: UploadProgress) => void
  ) => Promise<UploadResult>
  clearError: () => void
  reset: () => void
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([])

  const uploadImage = useCallback(async (file: File, options?: UploadOptions) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fileUploadService.uploadImage(file, options)
      setUploadedFiles((prev) => [...prev, result])
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Image upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uploadVideo = useCallback(async (file: File, options?: UploadOptions) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fileUploadService.uploadVideo(file, options)
      setUploadedFiles((prev) => [...prev, result])
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Video upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uploadMultipleImages = useCallback(
    async (files: File[], options?: UploadOptions) => {
      setIsLoading(true)
      setError(null)

      try {
        const results = await fileUploadService.uploadMultipleImages(
          files,
          options,
          (progressArray) => {
            // Aggregate progress from all uploads
            const totalLoaded = progressArray.reduce((sum, p) => sum + p.loaded, 0)
            const totalSize = progressArray.reduce((sum, p) => sum + p.total, 0)
            setProgress({
              loaded: totalLoaded,
              total: totalSize,
              percentage: totalSize > 0 ? Math.round((totalLoaded / totalSize) * 100) : 0,
            })
          }
        )
        setUploadedFiles((prev) => [...prev, ...results])
        setProgress(null)
        return results
      } catch (err: any) {
        const errorMessage = err.message || 'Image upload failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const uploadImageWithProgress = useCallback(
    async (
      file: File,
      options?: UploadOptions,
      onProgress?: (progress: UploadProgress) => void
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fileUploadService.uploadImageWithProgress(
          file,
          options,
          (progressData) => {
            setProgress(progressData)
            if (onProgress) {
              onProgress(progressData)
            }
          }
        )
        setUploadedFiles((prev) => [...prev, result])
        setProgress(null)
        return result
      } catch (err: any) {
        const errorMessage = err.message || 'Image upload failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setProgress(null)
    setError(null)
    setUploadedFiles([])
  }, [])

  return {
    isLoading,
    progress,
    error,
    uploadedFiles,
    uploadImage,
    uploadVideo,
    uploadMultipleImages,
    uploadImageWithProgress,
    clearError,
    reset,
  }
}
