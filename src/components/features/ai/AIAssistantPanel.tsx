import React, { useState, ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatMode from './ChatMode';
import MemoryMode from './MemoryMode';
import AnalysisMode from './AnalysisMode';
import { Sparkles, Close, MessageCircle, Database, BarChart } from '../../ui/Icons';
// FIX: Corrected import path for types to point to the new single source of truth.
import { AppContextState } from '../../../types/index';

interface AIAssistantPanelProps {
  onClose: () => void;
  appContext: AppContextState;
}

type Mode = 'chat' | 'memory' | 'analysis';

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onClose, appContext }) => {
  const [mode, setMode] = useState<Mode>('chat');

  useEffect(() => {
    const handleOpenRequest = (event: CustomEvent) => {
      if (event.detail?.mode) {
        setMode(event.detail.mode);
      }
    };
    // @ts-ignore
    window.addEventListener('open-ai-panel', handleOpenRequest);
    return () => { // @ts-ignore
        window.removeEventListener('open-ai-panel', handleOpenRequest)
    };
  }, []);

  const renderContent = () => {
    switch (mode) {
      case 'chat':
        return <ChatMode appContext={appContext} />;
      case 'memory':
        return <MemoryMode />;
      case 'analysis':
        return <AnalysisMode />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 sm:inset-auto sm:bottom-28 sm:right-8 w-full sm:w-[400px] sm:h-[650px] z-50 flex flex-col bg-white dark:bg-gray-800 sm:rounded-2xl shadow-2xl overflow-hidden border dark:border-gray-700"
    >
      <header className="flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-lg">Orbit AI</h3>
                <p className="text-xs text-white/80">Tu asistente de marketing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors" aria-label="Close AI Panel">
            <Close className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex space-x-2">
          <TabButton icon={<MessageCircle />} label="Chat" isActive={mode === 'chat'} onClick={() => setMode('chat')} />
          <TabButton icon={<Database />} label="Memoria" isActive={mode === 'memory'} onClick={() => setMode('memory')} />
          <TabButton icon={<BarChart />} label="Análisis" isActive={mode === 'analysis'} onClick={() => setMode('analysis')} notificationCount={3} />
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </motion.div>
  );
};

interface TabButtonProps {
    icon: ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    notificationCount?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick, notificationCount }) => (
    <button
      onClick={onClick}
      className={`relative flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
        isActive ? 'bg-white/20' : 'hover:bg-white/10'
      }`}
    >
      {icon}
      <span>{label}</span>
      {notificationCount && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {notificationCount}
        </span>
      )}
    </button>
);

export default AIAssistantPanel;