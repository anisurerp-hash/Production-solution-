
import React, { useState } from 'react';
import { useAppContext } from '../App';
import { Page } from '../types';
import { sendPasswordResetEmail } from '../services/firebaseService';

const ForgotPasswordPage: React.FC = () => {
  const { navigate } = useAppContext();
  const [email, setEmail] = useState('');
  const [officeId, setOfficeId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !officeId) {
      setError('Please provide both email and Office ID.');
      return;
    }

    try {
      const result = await sendPasswordResetEmail(email, officeId);
      if (result) {
        setSuccess('Password reset link sent successfully! Check your email.');
      } else {
        setError('Email address and Office ID not found.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1B2445] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#1B2445]">Forgot Password</h1>
          <p className="text-gray-500 mt-2">Enter your details to reset your password</p>
        </div>

        {error && <div className="bg-[#e74c3c] text-white p-3 rounded-md text-center">{error}</div>}
        {success && <div className="bg-[#27ae60] text-white p-3 rounded-md text-center">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B2445] focus:border-transparent outline-none transition"
          />
          <input
            type="text"
            placeholder="Office ID Number"
            value={officeId}
            onChange={(e) => setOfficeId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B2445] focus:border-transparent outline-none transition"
          />
          <button
            type="submit"
            className="w-full bg-[#1B2445] text-white font-bold py-3 rounded-lg hover:bg-[#2a3760] transition-colors duration-300"
          >
            Submit
          </button>
        </form>
        
        <div className="text-center text-sm text-gray-500">
          Remember your password?{' '}
          <button onClick={() => navigate(Page.Login)} className="font-medium text-[#1B2445] hover:underline">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;