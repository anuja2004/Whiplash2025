import React, { useState } from 'react'
import SignInForm from '../../components/forms/sign-in'
import SignUpForm from '../../components/forms/sign-up'
import {motion,AnimatePresence } from 'framer-motion'
import { signIn,signUp } from '../../api/auth'
import { useNavigate } from 'react-router-dom'
import ProjectFlow from './ProjectFlow';

const RegisterPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('signin')
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen)
  const navigate = useNavigate();
  // Function to handle sign-in/up api 
  const handleSignInSubmit = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signIn(credentials);
      // No need to set localStorage here as it's already done in signIn function
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUpSubmit = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signUp(userData);
      // No need to manually set token here either
      // The signUp function should handle token storage if needed
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100 relative overflow-x-hidden">
      {/* Top Banner with animated images */}
      <motion.div
        className="w-full flex flex-col md:flex-row items-center justify-center px-4 pt-16 mb-4 gap-4"
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
      >
        <motion.img
          src="/LearningVisIMG.png"
          alt="Learning Visual"
          className="w-60 md:w-[340px] mb-6 md:mb-0 drop-shadow-2xl hidden md:block ml-[100px]"
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1.1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.7, type: 'spring' }}
        />
        <div className="flex-1 mx-2 md:mx-8 text-center flex flex-col items-center justify-center">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Welcome to <span className="text-yellow-400 drop-shadow-md text-[60px] md:text-[150px]">Whiplash</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-2xl text-gray-700 mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Supercharge your learning journey.<br />Plan, track, and achieve your study goals with <span className="text-sky-500 font-semibold">AI-powered topic extraction</span> and <span className="text-pink-500 font-semibold">personalized scheduling</span>.
          </motion.p>
          <motion.button
            onClick={toggleModal}
            className="px-8 py-4 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 transition text-lg font-semibold mb-2"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
          >
            Get Started
          </motion.button>
        </div>
        <motion.img
          src="/PeopleWithCalendar.png"
          alt="People with Calendar"
          className="w-60 md:w-[340px] mb-6 md:mb-0 drop-shadow-2xl hidden md:block mr-[100px]"
          initial={{ scale: 0.8, rotate: 10 }}
          animate={{ scale: 1.1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.7, type: 'spring' }}
        />
      </motion.div>

      {/* Project Flow with React Flow */}
      <motion.div
        className="max-w-5xl w-full px-2 md:px-4 mt-2 md:mt-8 mb-8 md:mb-12"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-blue-900 tracking-tight">How Whiplash Works</h2>
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.7, type: 'spring' }}
        >
          <ProjectFlow />
        </motion.div>
        <div className="text-center text-gray-600 mt-4 text-base md:text-lg">
          <span className="font-semibold text-blue-700">Register</span> → <span className="font-semibold text-sky-500">Upload Syllabus</span> → <span className="font-semibold text-indigo-500">AI Extracts Topics</span> → <span className="font-semibold text-green-500">Personalized Plan</span> → <span className="font-semibold text-pink-500">Track &amp; Learn</span>
        </div>
      </motion.div>

      {/* Modal for Sign In / Sign Up */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div
              className="bg-white rounded-[25px] w-[95%] max-w-md p-6 shadow-2xl relative mx-auto"
            >
              {/* Tab Headers */}
              <div className="flex border-b mb-4">
                <button
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2 text-center ${
                    activeTab === 'signin' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 text-center ${
                    activeTab === 'signup' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'
                  }`}
                >
                  Sign Up
                </button>
              </div>
              {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
              {/* Forms */}
              {activeTab === 'signin' ? (
                <SignInForm onSubmit={handleSignInSubmit} loading={loading} />
              ) : (
                <SignUpForm onSubmit={handleSignUpSubmit} loading={loading} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RegisterPage
