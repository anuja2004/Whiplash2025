import React, { useState } from 'react';

const SignUpForm = ({ 
  onSwitchToSignIn, 
  onSubmit, 
  isLoading, 
  error, 
  setError, 
  setLoading 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Function to clear error when user starts typing
  const handleInputChange = (setter, value) => {
    if (error && setError) setError(null);
    if (passwordError) setPasswordError('');
    setter(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    onSubmit({ name, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
      <h2 className="text-2xl font-bold text-center text-gray-800">Create your account ✨</h2>
      
      <div className="flex flex-col">
        <label htmlFor="name" className="text-sm font-medium text-gray-600 mb-1">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => handleInputChange(setName, e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
          placeholder="John Doe"
          required
        />
      </div>
      
      <div className="flex flex-col">
        <label htmlFor="email" className="text-sm font-medium text-gray-600 mb-1">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => handleInputChange(setEmail, e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
          placeholder="you@example.com"
          required
        />
      </div>
      
      <div className="flex flex-col">
        <label htmlFor="password" className="text-sm font-medium text-gray-600 mb-1">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => handleInputChange(setPassword, e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
          placeholder="••••••••"
          required
        />
      </div>
      
      <div className="flex flex-col">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => handleInputChange(setConfirmPassword, e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
          placeholder="••••••••"
          required
        />
      </div>
      
      {passwordError && (
        <div className="rounded-2xl shadow-md border border-red-200 bg-red-50 p-3">
          <div className="text-red-500 text-sm text-center">
            {passwordError}
          </div>
        </div>
      )}
      
      {error && (
        <div className="rounded-2xl shadow-md border border-red-200 bg-red-50 p-3">
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        </div>
      )}
      
      <button
        type="submit"
        disabled={isLoading}
        className="bg-black text-white py-2 rounded-xl hover:bg-neutral-800 transition-all font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing Up...' : 'Sign Up'}
      </button>
      
      <div className="text-sm text-center text-gray-500">
        Already have an account?{' '}
        <button
          onClick={onSwitchToSignIn}
          className="font-medium text-black hover:underline"
          type="button"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};

export default SignUpForm;