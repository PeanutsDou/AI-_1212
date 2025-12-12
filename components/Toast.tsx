
import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(fadeTimer);
  }, []);

  useEffect(() => {
    // Actually remove component after animation completes (500ms)
    if (!isVisible) {
      const removeTimer = setTimeout(() => {
        onRemove(toast.id);
      }, 500);
      return () => clearTimeout(removeTimer);
    }
  }, [isVisible, onRemove, toast.id]);

  const bgColors = {
    success: 'bg-retro-bg border-green-500 text-green-400',
    error: 'bg-retro-bg border-red-500 text-red-400',
    info: 'bg-retro-bg border-retro-accent text-retro-accent'
  };

  return (
    <div className={`
      pointer-events-auto 
      mb-3 p-4 min-w-[300px] 
      border-l-4 border-t-2 border-r-2 border-b-2 
      ${bgColors[toast.type]} 
      shadow-[4px_4px_0px_#000]
      flex items-center justify-between
      font-pixel
      transition-all duration-500 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
    `}>
      <span className="font-bold text-lg">{toast.message}</span>
      <button 
        onClick={() => setIsVisible(false)} 
        className="ml-4 text-xs hover:text-white"
      >
        [X]
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};
