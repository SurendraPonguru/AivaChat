
import React, { useState } from 'react';
import { User } from '../../types';
import EmailIcon from '../icons/EmailIcon';
import LockIcon from '../icons/LockIcon';
import Spinner from '../Spinner';

interface SignupFormProps {
  onSuccess: (user: User) => void;
  switchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, switchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    // Simulate API call for registration
    setTimeout(() => {
      // Mock success
      console.log('Mock signup for:', email);
      onSuccess({ id: email, email }); // Using email as ID for mock
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center text-slate-100 mb-6">Create your AivaChat Account</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300 mb-1">
            Email Address
          </label>
           <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EmailIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="signup-email"
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
          <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow"
              placeholder="Choose a strong password"
            />
          </div>
        </div>
         <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1">
            Confirm Password
          </label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow"
              placeholder="Repeat your password"
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
            {isLoading ? <Spinner size="w-5 h-5" color="border-white" /> : 'Create Account'}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <button onClick={switchToLogin} className="font-medium text-sky-400 hover:text-sky-300 underline focus:outline-none">
          Login
        </button>
      </p>
    </div>
  );
};

export default SignupForm;
