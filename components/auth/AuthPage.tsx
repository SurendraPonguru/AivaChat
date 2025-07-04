import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import AivaLogo from '../icons/AivaLogo';
import { User } from '../../types';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  onSignupSuccess: (user: User) => void;
  onCancel: () => void; 
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onSignupSuccess, onCancel }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-row gap-[10%] items-center justify-center p-4">
      {!isMobile && (
        <div className="text-center">
          <AivaLogo className="w-16 h-16 text-teal-400 mx-auto mb-3" />
          <h1 className="text-4xl font-bold text-white">Welcome to AivaChat ✨</h1>
          <p className="text-slate-400 mt-2">Your intelligent conversation partner.</p>
        </div>
      )}

      <div className="w-full max-w-md p-8">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl">
          {isLoginView ? (
            <LoginForm 
              onSuccess={onLoginSuccess} 
              switchToSignup={() => setIsLoginView(false)} 
            />
          ) : (
            <SignupForm 
              onSuccess={onSignupSuccess} 
              switchToLogin={() => setIsLoginView(true)} 
            />
          )}
          <button 
            onClick={onCancel} 
            className="w-full mt-8 text-sm text-slate-400 hover:text-sky-300 underline focus:outline-none"
          >
            « Chat as Guest
          </button>
        </div>
        <p className="text-slate-500 text-sm mt-4 flex justify-center">
          &copy; {new Date().getFullYear()} AivaChat. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;