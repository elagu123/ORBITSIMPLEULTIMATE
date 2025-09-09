import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../ui/Button';
import { SkeletonCard, Spinner, PulseLoader, WaveLoader, LoadingOverlay, ProgressBar } from '../../ui/LoadingStates';
import DarkModeToggle from '../../ui/DarkModeToggle';
import { useToastNotifications } from '../../../store/toastContext';
import { Sparkles, Zap, Heart, Star, Rocket, Coffee } from '../../ui/Icons';

const UIShowcase: React.FC = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [progress, setProgress] = useState(45);
  const { success, error, warning, info } = useToastNotifications();

  const handleToastDemo = (type: string) => {
    switch (type) {
      case 'success':
        success('¡Éxito!', 'La operación se completó correctamente');
        break;
      case 'error':
        error('Error detectado', 'Algo salió mal, intenta nuevamente');
        break;
      case 'warning':
        warning('Atención', 'Revisa los datos antes de continuar');
        break;
      case 'info':
        info('Información', 'Nueva actualización disponible');
        break;
    }
  };

  const handleLoadingDemo = () => {
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), 3000);
  };

  const handleProgressDemo = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          success('¡Completado!', 'Progreso finalizado exitosamente');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          ✨ UI Components Showcase
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Nuevas mejoras de interfaz implementadas
        </p>
      </div>

      <div className="space-y-6">
        {/* Toast Notifications */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
            Notificaciones Toast
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="success" 
              size="sm" 
              onClick={() => handleToastDemo('success')}
              leftIcon={<Heart className="w-4 h-4" />}
            >
              Éxito
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={() => handleToastDemo('error')}
              leftIcon={<Zap className="w-4 h-4" />}
            >
              Error
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleToastDemo('warning')}
              leftIcon={<Star className="w-4 h-4" />}
            >
              Aviso
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleToastDemo('info')}
              leftIcon={<Coffee className="w-4 h-4" />}
            >
              Info
            </Button>
          </div>
        </div>

        {/* Loading States */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Rocket className="w-4 h-4 mr-2 text-purple-500" />
            Estados de Carga
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <LoadingOverlay isLoading={showLoading} spinner="default">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center text-sm">
                Spinner
              </div>
            </LoadingOverlay>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-center items-center">
              <PulseLoader />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-center items-center">
              <WaveLoader />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-center items-center">
              <Spinner color="purple" size="md" />
            </div>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleLoadingDemo}
            disabled={showLoading}
          >
            {showLoading ? 'Cargando...' : 'Demo Loading'}
          </Button>
        </div>

        {/* Progress Bar */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Barra de Progreso
          </h4>
          <ProgressBar 
            progress={progress} 
            showPercentage={true} 
            color="purple"
            className="mb-3"
          />
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleProgressDemo}
          >
            Demo Progreso
          </Button>
        </div>

        {/* Dark Mode Toggle */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Tema Oscuro/Claro
          </h4>
          <div className="flex items-center space-x-4">
            <DarkModeToggle size="sm" />
            <DarkModeToggle size="md" />
            <DarkModeToggle size="lg" />
          </div>
        </div>

        {/* Skeleton Loading */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Skeleton Loading
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>

        {/* Enhanced Buttons */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Botones Mejorados
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
              Primario
            </Button>
            <Button variant="secondary" rightIcon={<Rocket className="w-4 h-4" />}>
              Secundario
            </Button>
            <Button variant="success" size="sm">
              Éxito
            </Button>
            <Button variant="danger" size="lg">
              Peligro
            </Button>
            <Button variant="outline" loading>
              Cargando...
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UIShowcase;