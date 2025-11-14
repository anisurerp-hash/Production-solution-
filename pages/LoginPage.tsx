import React, { useState } from 'react';
import { useAppContext } from '../App';
import { Page } from '../types';
import { signInWithEmailAndPassword } from '../services/firebaseService';

const LoginPage: React.FC = () => {
  const { navigate, setUser } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill email address and password.');
      setLoading(false);
      return;
    }

    try {
      const user = await signInWithEmailAndPassword(email, password, rememberMe);
      if (user) {
        setUser(user);
        setSuccess('Login successful! Redirecting...');
        // Navigation will be handled by App.tsx's onAuthStateChanged
      } else {
        setError('Email address and password do not match.');
      }
    } catch (err) {
      setError('Email address and password do not match.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B2445] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#1B2445]">Production Solution</h1>
          <p className="text-gray-500 mt-2">Welcome back</p>
          <p className="text-sm text-gray-400">Enter your details for login</p>
        </div>

        {error && <div className="bg-[#e74c3c] text-white p-3 rounded-md text-center">{error}</div>}
        {success && <div className="bg-[#27ae60] text-white p-3 rounded-md text-center">{success}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B2445] focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>
          <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B2445] focus:border-transparent outline-none transition"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1B2445]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
                  <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-gray-600">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded text-[#1B2445] focus:ring-[#1B2445]" />
              <span>Remember me</span>
            </label>
            <button type="button" onClick={() => navigate(Page.ForgotPassword)} className="font-medium text-[#1B2445] hover:underline">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B2445] text-white font-bold py-3 rounded-lg hover:bg-[#2a3760] transition-colors duration-300 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          You have no account? Please{' '}
          <button onClick={() => navigate(Page.Register)} className="font-medium text-[#1B2445] hover:underline">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;