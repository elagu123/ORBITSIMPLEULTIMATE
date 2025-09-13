import { Workbox } from 'workbox-window';

// =============================================================================
// PWA SERVICE - Service Worker and Offline Management
// =============================================================================

export interface PWAUpdateInfo {
  isUpdateAvailable: boolean;
  skipWaiting: () => Promise<void>;
  updateServiceWorker: () => Promise<void>;
}

export interface PWAInstallInfo {
  canInstall: boolean;
  install: () => Promise<void>;
  isInstalled: boolean;
}

export interface NetworkStatus {
  isOnline: boolean;
  connection: string;
  saveData: boolean;
}

class PWAService {
  private workbox: Workbox | null = null;
  private updateCallback: ((updateInfo: PWAUpdateInfo) => void) | null = null;
  private installPrompt: any = null;
  private isInitialized = false;

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Initialize service worker
      await this.initializeServiceWorker();
      
      // Set up install prompt listener
      this.setupInstallPrompt();
      
      // Set up network monitoring
      this.setupNetworkMonitoring();
      
      this.isInitialized = true;
      console.log('✅ PWA Service initialized successfully');
    } catch (error) {
      console.error('❌ PWA Service initialization failed:', error);
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    // Skip service worker in development
    if (import.meta.env.MODE === 'development') {
      console.log('🔧 PWA Service Worker skipped in development mode');
      return;
    }
    
    if ('serviceWorker' in navigator) {
      this.workbox = new Workbox('/sw.js', { scope: '/' });

      // Service Worker lifecycle events
      this.workbox.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          console.log('🔄 New service worker version installed');
          this.handleUpdate();
        } else {
          console.log('✅ Service worker installed for the first time');
        }
      });

      this.workbox.addEventListener('waiting', () => {
        console.log('⏳ New service worker is waiting to take control');
        this.handleUpdate();
      });

      this.workbox.addEventListener('controlling', () => {
        console.log('🔄 New service worker is now controlling the page');
        window.location.reload();
      });

      this.workbox.addEventListener('activated', (event) => {
        if (event.isUpdate) {
          console.log('✅ Service worker updated successfully');
        }
      });

      // Register the service worker
      await this.workbox.register();
      console.log('📝 Service worker registered');
    } else {
      console.warn('⚠️ Service workers not supported in this browser');
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      console.log('📱 PWA install prompt ready');
      
      // Notify app that installation is available
      this.dispatchPWAEvent('pwa-install-available');
    });

    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      console.log('✅ PWA installed successfully');
      this.dispatchPWAEvent('pwa-installed');
    });
  }

  private setupNetworkMonitoring(): void {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Back online');
      this.dispatchPWAEvent('network-online');
    });

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline');
      this.dispatchPWAEvent('network-offline');
    });
  }

  private dispatchPWAEvent(type: string, detail?: any): void {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  }

  // ==========================================================================
  // UPDATE MANAGEMENT
  // ==========================================================================

  private handleUpdate(): void {
    if (this.workbox && this.updateCallback) {
      const updateInfo: PWAUpdateInfo = {
        isUpdateAvailable: true,
        skipWaiting: async () => {
          await this.workbox!.messageSkipWaiting();
        },
        updateServiceWorker: async () => {
          await this.workbox!.messageSkipWaiting();
        }
      };
      
      this.updateCallback(updateInfo);
    }
  }

  onUpdateAvailable(callback: (updateInfo: PWAUpdateInfo) => void): void {
    this.updateCallback = callback;
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.workbox) return false;

    try {
      const registration = await this.workbox.register();
      await registration.update();
      return true;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }

  // ==========================================================================
  // INSTALLATION MANAGEMENT
  // ==========================================================================

  canInstall(): boolean {
    return !!this.installPrompt && !this.isInstalled();
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  async install(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('⚠️ Install prompt not available');
      return false;
    }

    try {
      const result = await this.installPrompt.prompt();
      this.installPrompt = null;
      
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }

  getInstallInfo(): PWAInstallInfo {
    return {
      canInstall: this.canInstall(),
      install: () => this.install(),
      isInstalled: this.isInstalled()
    };
  }

  // ==========================================================================
  // NETWORK AND OFFLINE MANAGEMENT
  // ==========================================================================

  getNetworkStatus(): NetworkStatus {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      isOnline: navigator.onLine,
      connection: connection?.effectiveType || 'unknown',
      saveData: connection?.saveData || false
    };
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  // ==========================================================================
  // CACHE MANAGEMENT
  // ==========================================================================

  async clearCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ All caches cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheSize(): Promise<{ size: number; count: number }> {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      let totalCount = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        totalCount += requests.length;

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return { size: totalSize, count: totalCount };
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return { size: 0, count: 0 };
    }
  }

  async preloadCriticalResources(): Promise<void> {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      return;
    }

    const criticalResources = [
      '/',
      '/assets/orbit-logo.svg',
      // Add other critical resources
    ];

    try {
      const cache = await caches.open('critical-resources');
      await cache.addAll(criticalResources);
      console.log('✅ Critical resources preloaded');
    } catch (error) {
      console.error('Failed to preload critical resources:', error);
    }
  }

  // ==========================================================================
  // BACKGROUND SYNC
  // ==========================================================================

  async scheduleBackgroundSync(tag: string, data?: any): Promise<void> {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      console.warn('Background sync not available');
      return;
    }

    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'BACKGROUND_SYNC',
        tag,
        data
      });
    } catch (error) {
      console.error('Failed to schedule background sync:', error);
    }
  }

  // ==========================================================================
  // PUSH NOTIFICATIONS
  // ==========================================================================

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return 'denied';
  }

  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    const permission = await this.requestNotificationPermission();
    
    if (permission === 'granted') {
      if (navigator.serviceWorker.controller) {
        // Show via service worker for better persistence
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: {
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            ...options
          }
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          icon: '/pwa-192x192.png',
          ...options
        });
      }
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  isPWACapable(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window &&
           'Cache' in window;
  }

  getDisplayMode(): string {
    if (this.isInstalled()) {
      return 'standalone';
    }
    return 'browser';
  }

  // ==========================================================================
  // DEBUGGING AND DIAGNOSTICS
  // ==========================================================================

  async getDiagnostics(): Promise<any> {
    const networkStatus = this.getNetworkStatus();
    const cacheInfo = await this.getCacheSize();
    
    return {
      isInitialized: this.isInitialized,
      isOnline: networkStatus.isOnline,
      connection: networkStatus.connection,
      saveData: networkStatus.saveData,
      canInstall: this.canInstall(),
      isInstalled: this.isInstalled(),
      displayMode: this.getDisplayMode(),
      notificationPermission: Notification?.permission || 'not-supported',
      serviceWorkerSupported: 'serviceWorker' in navigator,
      cacheSize: `${(cacheInfo.size / 1024 / 1024).toFixed(2)} MB`,
      cachedItems: cacheInfo.count,
      isPWACapable: this.isPWACapable()
    };
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const pwaService = new PWAService();

// Auto-initialize PWA service
if (typeof window !== 'undefined') {
  pwaService.initialize().catch(console.error);
}

export default pwaService;