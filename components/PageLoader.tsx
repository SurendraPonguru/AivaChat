
import React from 'react';
import AivaLogo from './icons/AivaLogo';

const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <AivaLogo className="w-24 h-24 text-teal-400 animate-pulse" />
      <p className="mt-6 text-xl text-slate-200 font-semibold">AivaChat is waking up...</p>
      <p className="mt-2 text-sm text-slate-400">Initializing your AI assistant...</p>
    </div>
  );
};

export default PageLoader;