'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const options = {
      duration: 4000,
      style: {
        borderRadius: '12px',
        background: '#3b1f0a', // coffee-900
        color: '#fdfaf6', // cream-50
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid #4a2d18',
      },
    };

    if (type === 'success') {
      toast.success(message, {
        ...options,
        style: { ...options.style, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
      });
    } else if (type === 'error') {
      toast.error(message, {
        ...options,
        style: { ...options.style, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    } else {
      toast(message, options);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'animate-slide-up',
        }}
      />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
