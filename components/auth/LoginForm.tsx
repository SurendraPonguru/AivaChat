
import React, { useState } from 'react';
import { User } from '../../types';
import EmailIcon from '../icons/EmailIcon';
import LockIcon from '../icons/LockIcon';
import Spinner from '../Spinner';

interface LoginFormProps {
  onSuccess: (user: User) => void;
  switchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock success: in a real app, you'd validate credentials
      console.log('Mock login for:', email);
      onSuccess({ id: email, email }); // Using email as ID for mock
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center text-slate-100 mb-6">Login to AivaChat</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EmailIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner size="w-5 h-5" color="border-white" /> : 'Login'}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <button onClick={switchToSignup} className="font-medium text-sky-400 hover:text-sky-300 underline focus:outline-none">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
