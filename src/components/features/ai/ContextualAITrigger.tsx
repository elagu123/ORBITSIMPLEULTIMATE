import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../ui/Button';
import { Sparkles, Close } from '../../ui/Icons';

interface ContextualAITriggerProps {
    onAddCustomerClick: () => void;
}

const ContextualAITrigger: React.FC<ContextualAITriggerProps> = ({ onAddCustomerClick }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-primary-50 dark:bg-gray-800 border border-primary-200 dark:border-gray-700 p-4 rounded-lg flex items-start space-x-4"
    >
      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-primary-500" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-primary-800 dark:text-primary-200">¿Necesitas ayuda para empezar?</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
          Veo que aún no tienes clientes. Puedo ayudarte a importarlos desde un archivo o puedes agregarlos manualmente.
        </p>
        <div className="mt-3 space-x-2">
            <Button size="sm" onClick={() => alert('¡La función de importación con IA estará disponible pronto!')}>Importar con IA</Button>
            <Button size="sm" variant="secondary" onClick={onAddCustomerClick}>Agregar manualmente</Button>
        </div>
      </div>
      <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <Close className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export default ContextualAITrigger;