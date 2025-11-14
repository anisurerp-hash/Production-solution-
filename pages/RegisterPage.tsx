import React, { useState } from 'react';
import { useAppContext } from '../App';
import { Page, User } from '../types';
import { createUserWithEmailAndPassword } from '../services/firebaseService';

const RegisterPage: React.FC = () => {
  const { navigate } = useAppContext();
  const [formData, setFormData] = useState({
    fullName: '',
    officeId: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    for (const key in formData) {
      if (formData[key as keyof typeof formData] === '') {
        setError('All fields are required.');
        setLoading(false);
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const additionalData: Omit<User, 'uid' | 'email'> = { ...formData, profilePictureUrl: '' };
      
      const newUser = await createUserWithEmailAndPassword(
        formData.email,
        formData.password,
        additionalData,
        profilePicture
      );

      if (newUser) {
        setSuccess('Registration successful! Please login.');
        setTimeout(() => navigate(Page.Login), 2000);
      } else {
        setError('User with this email already exists.');
      }
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
            setError('This email address is already in use.');
        } else {
            setError('An error occurred during registration.');
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B2445] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#1B2445]">Create Account</h1>
          <p className="text-gray-500 mt-2">Join Production Solution today</p>
        </div>
        
        {error && <div className="bg-[#e74c3c] text-white p-3 rounded-md text-center mb-4">{error}</div>}
        {success && <div className="bg-[#27ae60] text-white p-3 rounded-md text-center mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <input name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none" />
          <input name="officeId" placeholder="Office ID Number" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none" />
          <input name="designation" placeholder="Designation" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none" />
          <input name="department" placeholder="Department" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none" />
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none" />
          <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none" />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none" />
          
          <div className="flex items-center space-x-4">
              {picturePreview && <img src={picturePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover"/>}
             <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2a3760] file:text-white hover:file:bg-[#1B2445]"/>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#1B2445] text-white font-bold py-3 rounded-lg hover:bg-[#2a3760] transition-colors disabled:bg-gray-400">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate(Page.Login)} className="font-medium text-[#1B2445] hover:underline">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;