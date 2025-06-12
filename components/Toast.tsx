import React, { useEffect, useState } from 'react';
import ErrorIcon from './icons/ErrorIcon';
// import CloseIcon from './icons/CloseIcon'; // Unused import removed

interface ToastProps {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for animation to finish before calling onDismiss
      setTimeout(() => onDismiss(id), 300); 
    }, 7000); // Auto-dismiss after 7 seconds

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300); 
  };

  let bgColor = 'bg-slate-600';
  let textColor = 'text-white';
  let iconColor = 'text-sky-300'; // Default for info

  if (type === 'error') {
    bgColor = 'bg-red-600';
    textColor = 'text-white';
    iconColor = 'text-red-100';
  } else if (type === 'success') {
    bgColor = 'bg-green-600';
    textColor = 'text-white';
    iconColor = 'text-green-100';
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`
        flex items-start p-4 rounded-lg shadow-2xl w-full max-w-sm transition-all duration-300 ease-in-out
        ${bgColor} ${textColor}
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
    >
      <div className="flex-shrink-0 mr-3">
        {type === 'error' && <ErrorIcon className={`w-6 h-6 ${iconColor}`} />}
        {/* Add other icons for success/info if needed */}
      </div>
      <div className="flex-grow text-sm break-words">
        <p className="font-semibold capitalize">{type}</p>
        <p>{message}</p>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className={`ml-3 p-1 rounded-md hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white/50 ${textColor}`}
      >
        {/* Using a simple 'X' for close */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;