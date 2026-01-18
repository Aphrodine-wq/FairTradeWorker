/**
 * Firebase Push Notification Service
 *
 * Handles push notifications across web and mobile
 * - Web push notifications
 * - Device registration
 * - Notification routing
 * - Badge management
 * - Background notifications
 *
 * Configuration required in .env:
 * REACT_APP_FIREBASE_API_KEY=your_api_key
 * REACT_APP_FIREBASE_PROJECT_ID=your_project_id
 * REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
 * REACT_APP_FIREBASE_APP_ID=your_app_id
 *
 * Usage:
 * await firebaseService.initialize()
 * const token = await firebaseService.getDeviceToken()
 * await firebaseService.subscribeToTopic('jobs_nearby')
 */

import { apiClient } from './apiClient'

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, string>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export interface DeviceToken {
  token: string
  platform: 'web' | 'ios' | 'android'
  userAgent?: string
  deviceName?: string
}

export interface TopicSubscription {
  userId: string
  topics: string[]
  createdAt: Date
}

class FirebaseService {
  private messaging: any = null
  private initialized = false
  private serviceWorkerPath = '/firebase-messaging-sw.js'

  constructor() {
    this.initializeFirebase()
  }

  /**
   * Initialize Firebase
   */
  private initializeFirebase() {
    if (typeof window !== 'undefined') {
      // Firebase initialization happens via firebase script tag in HTML
      // or import statement in main.tsx
      console.log('Firebase service ready for initialization')
    }
  }

  /**
   * Initialize messaging
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // This assumes Firebase is loaded globally or via import
      const firebase = (window as any).firebase || (await import('firebase/app'))

      if (!firebase.initializeApp) {
        console.warn('Firebase not loaded. Initialize Firebase in your app first.')
        return
      }

      // Get messaging instance
      const messaging = firebase.messaging ? firebase.messaging() : null

      if (!messaging) {
        console.warn('Firebase Messaging not available')
        return
      }

      this.messaging = messaging
      this.initialized = true

      // Register service worker
      await this.registerServiceWorker()

      // Request permission and get token
      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          const token = await this.getDeviceToken()
          console.log('Device token obtained:', token)
        }
      } catch (err) {
        console.log('Notification permission denied or not available')
      }

      // Handle foreground notifications
      this.messaging.onMessage((payload: any) => {
        console.log('Foreground notification:', payload)
        this.handleForegroundNotification(payload)
      })
    } catch (err) {
      console.error('Failed to initialize Firebase messaging:', err)
    }
  }

  /**
   * Register service worker for background notifications
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // Service worker should contain Firebase messaging initialization
        const registration = await navigator.serviceWorker.register(this.serviceWorkerPath)
        console.log('Service worker registered:', registration)
      } catch (err) {
        console.error('Service worker registration failed:', err)
      }
    }
  }

  /**
   * Get device token for this device
   */
  async getDeviceToken(): Promise<string> {
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized')
    }

    try {
      const token = await this.messaging.getToken({
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      })

      if (token) {
        // Save token to backend
        await this.saveDeviceToken(token)
        return token
      } else {
        throw new Error('Failed to get device token')
      }
    } catch (err: any) {
      throw new Error(`Failed to get device token: ${err.message}`)
    }
  }

  /**
   * Save device token to backend
   */
  async saveDeviceToken(token: string): Promise<void> {
    try {
      await apiClient.client.post('/api/notifications/device-token', {
        token,
        platform: 'web',
        userAgent: navigator.userAgent,
      })
    } catch (err) {
      console.error('Failed to save device token:', err)
    }
  }

  /**
   * Subscribe to notification topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      const token = await this.getDeviceToken()
      await apiClient.client.post('/api/notifications/subscribe', {
        topic,
        token,
      })
      console.log(`Subscribed to topic: ${topic}`)
    } catch (err) {
      console.error(`Failed to subscribe to topic ${topic}:`, err)
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      const token = await this.getDeviceToken()
      await apiClient.client.post('/api/notifications/unsubscribe', {
        topic,
        token,
      })
      console.log(`Unsubscribed from topic: ${topic}`)
    } catch (err) {
      console.error(`Failed to unsubscribe from topic ${topic}:`, err)
    }
  }

  /**
   * Send notification to specific users
   * (Note: This should typically be done from backend only)
   */
  async sendNotificationToUsers(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<void> {
    try {
      await apiClient.client.post('/api/notifications/send', {
        userIds,
        payload,
      })
    } catch (err) {
      console.error('Failed to send notifications:', err)
    }
  }

  /**
   * Send notification to topic
   * (Note: This should typically be done from backend only)
   */
  async sendNotificationToTopic(topic: string, payload: NotificationPayload): Promise<void> {
    try {
      await apiClient.client.post('/api/notifications/send-to-topic', {
        topic,
        payload,
      })
    } catch (err) {
      console.error('Failed to send topic notification:', err)
    }
  }

  /**
   * Handle foreground notification
   */
  private handleForegroundNotification(payload: any) {
    const { title, body, data } = payload.notification || {}

    if ('Notification' in window && Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: body || '',
        icon: data?.icon || '/logo.png',
        badge: data?.badge || '/logo.png',
        tag: data?.tag,
        data: data || {},
      }

      new Notification(title || 'FairTradeWorker', options)
    }
  }

  /**
   * Subscribe user to location-based notifications
   */
  async subscribeToLocationNotifications(latitude: number, longitude: number, radius: number = 5): Promise<void> {
    try {
      await apiClient.client.post('/api/notifications/location-subscribe', {
        latitude,
        longitude,
        radius, // in miles
      })
    } catch (err) {
      console.error('Failed to subscribe to location notifications:', err)
    }
  }

  /**
   * Unsubscribe from location notifications
   */
  async unsubscribeFromLocationNotifications(): Promise<void> {
    try {
      await apiClient.client.post('/api/notifications/location-unsubscribe', {})
    } catch (err) {
      console.error('Failed to unsubscribe from location notifications:', err)
    }
  }

  /**
   * Subscribe to category-based notifications
   */
  async subscribeToCategoryNotifications(categories: string[]): Promise<void> {
    try {
      for (const category of categories) {
        await this.subscribeToTopic(`category_${category.toLowerCase()}`)
      }
    } catch (err) {
      console.error('Failed to subscribe to category notifications:', err)
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: {
    enablePush?: boolean
    enableEmail?: boolean
    enableSMS?: boolean
    categories?: string[]
    quietHours?: {
      start: string
      end: string
    }
  }): Promise<void> {
    try {
      await apiClient.client.post('/api/notifications/preferences', preferences)
    } catch (err) {
      console.error('Failed to update notification preferences:', err)
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(filters?: {
    limit?: number
    offset?: number
    type?: string
    read?: boolean
  }): Promise<{
    notifications: Array<{
      id: string
      title: string
      body: string
      type: string
      read: boolean
      createdAt: Date
    }>
    total: number
  }> {
    try {
      const response = await apiClient.client.get('/api/notifications/history', {
        params: filters,
      })
      return response.data.data
    } catch (err) {
      console.error('Failed to get notification history:', err)
      throw err
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.client.patch(`/api/notifications/${notificationId}/read`, {})
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await apiClient.client.post('/api/notifications/clear', {})
    } catch (err) {
      console.error('Failed to clear notifications:', err)
    }
  }

  /**
   * Test notification (for development)
   */
  async sendTestNotification(title: string, body: string): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
      })
    }
  }

  /**
   * Check notification permission status
   */
  getNotificationPermissionStatus(): NotificationPermission {
    return Notification.permission
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        // Get device token now that permission is granted
        const token = await this.getDeviceToken()
        console.log('Device token obtained after permission grant:', token)
      }
      return permission
    } catch (err) {
      console.error('Failed to request notification permission:', err)
      return Notification.permission
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const firebaseService = new FirebaseService()

export { FirebaseService }
