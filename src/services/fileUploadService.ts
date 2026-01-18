/**
 * File Upload Service
 *
 * Handles file uploads with Cloudinary
 * - Image uploads
 * - Video uploads
 * - Progress tracking
 * - Image optimization
 * - Error handling
 *
 * Configuration required in .env:
 * REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
 * REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
 *
 * Usage:
 * const url = await fileUploadService.uploadImage(file)
 * const { url, progress } = await fileUploadService.uploadWithProgress(file)
 */

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  url: string
  publicId: string
  width?: number
  height?: number
  format?: string
  fileSize?: number
}

export interface UploadOptions {
  folder?: string
  maxSize?: number // in MB
  allowedFormats?: string[]
  quality?: 'auto' | 'quality:60' | 'quality:80' | 'quality:100'
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale'
  gravity?: 'auto' | 'face' | 'center'
}

class FileUploadService {
  private cloudinaryCloudName: string
  private cloudinaryUploadPreset: string
  private cloudinaryUrl = 'https://api.cloudinary.com/v1_1'

  constructor() {
    this.cloudinaryCloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || ''
    this.cloudinaryUploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || ''

    if (!this.cloudinaryCloudName || !this.cloudinaryUploadPreset) {
      console.warn(
        'Cloudinary credentials not configured. Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in .env'
      )
    }
  }

  /**
   * Upload a single image
   */
  async uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    this.validateFile(file, options)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', this.cloudinaryUploadPreset)

    if (options.folder) {
      formData.append('folder', options.folder)
    }

    const transformation = this.buildTransformation(options, 'image')
    if (Object.keys(transformation).length > 0) {
      formData.append('transformation', JSON.stringify(transformation))
    }

    const response = await fetch(
      `${this.cloudinaryUrl}/${this.cloudinaryCloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Upload failed: ${error.error?.message}`)
    }

    const data = await response.json()
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      fileSize: data.bytes,
    }
  }

  /**
   * Upload a video
   */
  async uploadVideo(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    if (!file.type.startsWith('video/')) {
      throw new Error('File must be a video')
    }

    const maxSize = options.maxSize || 100 // 100MB default for video
    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`Video must be smaller than ${maxSize}MB`)
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', this.cloudinaryUploadPreset)
    formData.append('resource_type', 'video')

    if (options.folder) {
      formData.append('folder', options.folder)
    }

    const response = await fetch(
      `${this.cloudinaryUrl}/${this.cloudinaryCloudName}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Upload failed: ${error.error?.message}`)
    }

    const data = await response.json()
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      fileSize: data.bytes,
    }
  }

  /**
   * Upload multiple images with progress tracking
   */
  async uploadMultipleImages(
    files: File[],
    options: UploadOptions = {},
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    const progressTracking = files.map(() => ({ loaded: 0, total: 0, percentage: 0 }))

    const uploadPromises = files.map((file, index) =>
      this.uploadImageWithProgress(file, options, (progress) => {
        progressTracking[index] = progress
        if (onProgress) {
          onProgress(progressTracking)
        }
      }).then((result) => {
        results[index] = result
      })
    )

    await Promise.all(uploadPromises)
    return results
  }

  /**
   * Upload image with progress tracking
   */
  async uploadImageWithProgress(
    file: File,
    options: UploadOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    this.validateFile(file, options)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', this.cloudinaryUploadPreset)

      if (options.folder) {
        formData.append('folder', options.folder)
      }

      const transformation = this.buildTransformation(options, 'image')
      if (Object.keys(transformation).length > 0) {
        formData.append('transformation', JSON.stringify(transformation))
      }

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress: UploadProgress = {
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100),
            }
            onProgress(progress)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText)
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            fileSize: data.bytes,
          })
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'))
      })

      xhr.open('POST', `${this.cloudinaryUrl}/${this.cloudinaryCloudName}/image/upload`)
      xhr.send(formData)
    })
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(
    url: string,
    options: {
      width?: number
      height?: number
      crop?: 'fill' | 'fit' | 'scale'
      quality?: 'auto' | 'quality:60' | 'quality:80' | 'quality:100'
      gravity?: 'auto' | 'face' | 'center'
    } = {}
  ): string {
    if (!url.includes('cloudinary')) {
      return url // Return original if not from Cloudinary
    }

    const transformation: string[] = []

    if (options.width || options.height) {
      transformation.push(
        `c_${options.crop || 'fill'},w_${options.width || 'auto'},h_${options.height || 'auto'}`
      )
    }

    if (options.gravity) {
      transformation.push(`g_${options.gravity}`)
    }

    if (options.quality) {
      transformation.push(options.quality)
    }

    if (transformation.length === 0) {
      return url
    }

    // Insert transformation into Cloudinary URL
    // Expected format: https://res.cloudinary.com/cloud_name/image/upload/...
    return url.replace('/upload/', `/upload/${transformation.join(',')}/`)
  }

  /**
   * Delete a file from Cloudinary (requires backend due to API key requirement)
   */
  async deleteFile(publicId: string): Promise<void> {
    // This should be done via backend to avoid exposing API key
    // For now, just log a warning
    console.warn(
      `File deletion for ${publicId} should be handled by backend with proper API key authentication`
    )
  }

  /**
   * Get responsive image URL variants
   */
  getResponsiveImageVariants(publicId: string): {
    small: string
    medium: string
    large: string
    original: string
  } {
    const baseUrl = `https://res.cloudinary.com/${this.cloudinaryCloudName}/image/upload`

    return {
      small: `${baseUrl}/w_400,h_300,c_fill/${publicId}`,
      medium: `${baseUrl}/w_800,h_600,c_fill/${publicId}`,
      large: `${baseUrl}/w_1200,h_900,c_fill/${publicId}`,
      original: `${baseUrl}/${publicId}`,
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, options: UploadOptions = {}) {
    const maxSize = options.maxSize || 10 // 10MB default
    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`File must be smaller than ${maxSize}MB`)
    }

    const allowedFormats = options.allowedFormats || ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedFormats.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }
  }

  /**
   * Build transformation object for Cloudinary
   */
  private buildTransformation(
    options: UploadOptions,
    type: 'image' | 'video'
  ): Record<string, unknown> {
    const transformation: Record<string, unknown> = {}

    if (options.width || options.height) {
      transformation.crop = options.crop || 'fill'
      if (options.width) transformation.width = options.width
      if (options.height) transformation.height = options.height
    }

    if (options.gravity) {
      transformation.gravity = options.gravity
    }

    if (type === 'image' && options.quality) {
      transformation.quality = options.quality
    }

    return transformation
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const fileUploadService = new FileUploadService()

export { FileUploadService }
