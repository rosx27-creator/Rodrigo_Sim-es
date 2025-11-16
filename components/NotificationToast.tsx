
import React, { useEffect, useState } from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

export interface Notification {
  message: string;
  type: 'success' | 'info';
  id: number;
}

interface NotificationToastProps {
  notification: Notification | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification && !isVisible) return null;

  return (
    <div 
      className={`fixed top-24 right-4 z-50 transition-all duration-500 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
      }`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md ${
        notification?.type === 'success' 
          ? 'bg-grass-900/90 border-grass-500 text-white shadow-grass-500/20' 
          : 'bg-slate-800/90 border-slate-600 text-slate-200'
      }`}>
        {notification?.type === 'success' ? (
          <div className="bg-grass-500 rounded-full p-1 text-white">
            <CheckCircle size={16} />
          </div>
        ) : (
          <Info size={20} className="text-blue-400" />
        )}
        
        <div className="flex flex-col">
          <span className="font-medium text-sm">{notification?.message}</span>
        </div>

        <button onClick={() => setIsVisible(false)} className="ml-2 opacity-70 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
