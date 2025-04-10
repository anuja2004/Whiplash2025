import React, { useState } from 'react'

const SignInForm = ({onSwitchToSignUp}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Sign In:', { email, password })
    // Add your logic: API call / error handling etc.
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
      <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back 👋</h2>

      <div className="flex flex-col">
        <label htmlFor="email" className="text-sm font-medium text-gray-600 mb-1">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-black text-white py-2 rounded-xl hover:bg-neutral-800 transition-all font-medium"
      >
        Sign In
      </button>

      <div className="text-sm text-center text-gray-500">
        <p className="mb-1">
          <a href="#" className="hover:underline">Forgot your password?</a>
        </p>
        <p>
          Don’t have an account? 
          <button
            onClick={onSwitchToSignUp}
            className="text-black font-semibold hover:underline
            transition-all duration-200
            ml-1"
    

            type="button"
          >
            Sign Up
          </button>
        </p>
      </div>
    </form>
  )
}

export default SignInForm
