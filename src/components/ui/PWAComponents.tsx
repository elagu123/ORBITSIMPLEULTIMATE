import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Wifi, WifiOff, Smartphone, X, Check } from './Icons';
import Button from './Button';
import { pwaService, PWAUpdateInfo, PWAInstallInfo, NetworkStatus } from '../../services/pwaService';
import { useTranslation } from '../../hooks/useTranslation';
import { trackEvent } from '../../services/analytics';

// =============================================================================
// PWA INSTALL BANNER
// =============================================================================

interface InstallBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export const PWAInstallBanner: React.FC<InstallBannerProps> = ({ onDismiss, className = '' }) => {
  const [installInfo, setInstallInfo] = useState<PWAInstallInfo>({ canInstall: false, install: async () => false, isInstalled: false });
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const checkInstallability = () => {
      const info = pwaService.getInstallInfo();
      setInstallInfo(info);
      setIsVisible(info.canInstall && !info.isInstalled);
    };

    // Initial check
    checkInstallability();

    // Listen for PWA events
    const handleInstallAvailable = () => {
      checkInstallability();
      trackEvent('pwa_install_prompt_shown');
    };

    const handleInstalled = () => {
      setIsVisible(false);
      trackEvent('pwa_installed');
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    trackEvent('pwa_install_clicked');

    try {
      const success = await installInfo.install();
      if (success) {
        setIsVisible(false);
        trackEvent('pwa_install_accepted');
      } else {
        trackEvent('pwa_install_declined');
      }
    } catch (error) {
      console.error('Installation failed:', error);
      trackEvent('pwa_install_failed', { error: (error as Error).message });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    trackEvent('pwa_install_dismissed');
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 
                    bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50
                    animate-slide-up ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            {t('pwa.installTitle', { defaultValue: 'Instalar Orbit MKT' })}
          </h3>
          <p className="text-xs text-white/90 mb-3">
            {t('pwa.installDescription', { 
              defaultValue: 'Accede más rápido y trabaja sin conexión instalando la app.' 
            })}
          </p>
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleInstall}
              disabled={isInstalling}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              {isInstalling ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  {t('common.installing', { defaultValue: 'Instalando...' })}
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 mr-1" />
                  {t('buttons.install', { defaultValue: 'Instalar' })}
                </>
              )}
            </Button>
            
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white transition-colors p-1"
              aria-label={t('buttons.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PWA UPDATE NOTIFICATION
// =============================================================================

interface UpdateNotificationProps {
  className?: string;
}

export const PWAUpdateNotification: React.FC<UpdateNotificationProps> = ({ className = '' }) => {
  const [updateInfo, setUpdateInfo] = useState<PWAUpdateInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleUpdateAvailable = (updateInfo: PWAUpdateInfo) => {
      setUpdateInfo(updateInfo);
      trackEvent('pwa_update_available');
    };

    pwaService.onUpdateAvailable(handleUpdateAvailable);
  }, []);

  const handleUpdate = async () => {
    if (!updateInfo) return;

    setIsUpdating(true);
    trackEvent('pwa_update_clicked');

    try {
      await updateInfo.updateServiceWorker();
      trackEvent('pwa_update_completed');
    } catch (error) {
      console.error('Update failed:', error);
      trackEvent('pwa_update_failed', { error: (error as Error).message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setUpdateInfo(null);
    trackEvent('pwa_update_dismissed');
  };

  if (!updateInfo) return null;

  return (
    <div className={`fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                    rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slide-down ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
            {t('pwa.updateTitle', { defaultValue: 'Actualización Disponible' })}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            {t('pwa.updateDescription', { 
              defaultValue: 'Una nueva versión está lista. Actualiza para obtener las últimas mejoras.' 
            })}
          </p>
          
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="text-xs"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  {t('common.updating', { defaultValue: 'Actualizando...' })}
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  {t('buttons.update', { defaultValue: 'Actualizar' })}
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-xs"
            >
              {t('buttons.later', { defaultValue: 'Más tarde' })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// NETWORK STATUS INDICATOR
// =============================================================================

interface NetworkStatusProps {
  className?: string;
  showText?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ className = '', showText = false }) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({ isOnline: true, connection: 'unknown', saveData: false });
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const updateNetworkStatus = () => {
      const status = pwaService.getNetworkStatus();
      setNetworkStatus(status);
      
      if (!status.isOnline) {
        setShowOfflineMessage(true);
        trackEvent('network_offline');
      }
    };

    // Initial status
    updateNetworkStatus();

    const handleOnline = () => {
      updateNetworkStatus();
      setShowOfflineMessage(false);
      trackEvent('network_online');
    };

    const handleOffline = () => {
      updateNetworkStatus();
      setShowOfflineMessage(true);
      trackEvent('network_offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('network-online', handleOnline);
    window.addEventListener('network-offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('network-online', handleOnline);
      window.removeEventListener('network-offline', handleOffline);
    };
  }, []);

  const getConnectionQuality = (connection: string) => {
    switch (connection) {
      case 'slow-2g':
      case '2g':
        return { text: 'Conexión lenta', color: 'text-red-500' };
      case '3g':
        return { text: 'Conexión media', color: 'text-yellow-500' };
      case '4g':
      case '5g':
        return { text: 'Conexión rápida', color: 'text-green-500' };
      default:
        return { text: 'Conexión desconocida', color: 'text-gray-500' };
    }
  };

  if (!showOfflineMessage && networkStatus.isOnline) {
    return null; // Don't show when online unless explicitly requested
  }

  const connectionInfo = getConnectionQuality(networkStatus.connection);

  return (
    <>
      {/* Online/Offline indicator */}
      {!networkStatus.isOnline && (
        <div className={`fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50 ${className}`}>
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t('network.offline', { defaultValue: 'Sin conexión - Trabajando en modo offline' })}
            </span>
          </div>
        </div>
      )}

      {/* Connection quality indicator (when requested) */}
      {showText && networkStatus.isOnline && (
        <div className={`flex items-center space-x-1 ${className}`}>
          <Wifi className={`w-4 h-4 ${connectionInfo.color}`} />
          {showText && (
            <span className={`text-xs ${connectionInfo.color}`}>
              {connectionInfo.text}
            </span>
          )}
          {networkStatus.saveData && (
            <span className="text-xs text-orange-500 ml-2">
              {t('network.saveData', { defaultValue: 'Ahorro de datos' })}
            </span>
          )}
        </div>
      )}
    </>
  );
};

// =============================================================================
// PWA STATUS BADGE
// =============================================================================

export const PWAStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isPWA, setIsPWA] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsPWA(pwaService.isInstalled());
  }, []);

  if (!isPWA) return null;

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 
                    text-green-700 dark:text-green-400 rounded-full text-xs font-medium ${className}`}>
      <Smartphone className="w-3 h-3" />
      <span>{t('pwa.installed', { defaultValue: 'App Instalada' })}</span>
    </div>
  );
};

// =============================================================================
// OFFLINE INDICATOR
// =============================================================================

interface OfflineIndicatorProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  children, 
  fallback, 
  className = '' 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        {fallback || (
          <>
            <WifiOff className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('offline.title', { defaultValue: 'Sin conexión' })}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('offline.message', { 
                defaultValue: 'Algunas funciones pueden estar limitadas sin conexión a internet.' 
              })}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('buttons.retry', { defaultValue: 'Reintentar' })}
            </Button>
          </>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default {
  PWAInstallBanner,
  PWAUpdateNotification,
  NetworkStatus,
  PWAStatusBadge,
  OfflineIndicator
};