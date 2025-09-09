import React, { createContext, useContext, ReactNode } from 'react';
import { useToast, ToastType } from '../components/ui/Toast';

interface ToastContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  ToastContainer: React.ComponentType;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <toast.ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToastNotifications = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastNotifications must be used within a ToastProvider');
  }
  return context;
};