
import React from 'react';

interface SpinnerProps {
  size?: string;
  color?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'w-5 h-5', color = 'border-blue-500', className = '' }) => {
  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${size} ${color} ${className}`}></div>
  );
};

export default Spinner;
