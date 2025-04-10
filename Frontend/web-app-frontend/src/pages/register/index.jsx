import React, { useState } from 'react'
import SignInForm from '../../components/forms/sign-in'
import SignUpForm from '../../components/forms/sign-up'
import { motion,AnimatePresence } from 'framer-motion'


const RegisterPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('signin')

  const toggleModal = () => setIsModalOpen(!isModalOpen)

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 relative">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-bold mb-4">Think. Plan. Track.</h1>
        <p className="text-lg text-gray-600 mb-6">All in one place with Whiplash.</p>
        <button
          onClick={toggleModal}
          className="px-6 py-3 bg-black text-white rounded-md hover:bg-neutral-800 transition"
        >
          Get Whiplash
        </button>
      </div>

      {/* MODAL */}
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
   className="bg-white rounded-[25px] w-[90%] max-w-md p-6 shadow-2xl relative mx-auto"
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

            {/* Tab Content */}
            <AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    className="w-full"
  >
    <div className="min-h-[280px]"> {/* Add min height to reduce height flickering */}
      {activeTab === 'signin' && <SignInForm />}
      {activeTab === 'signup' && <SignUpForm />}
    </div>
  </motion.div>
</AnimatePresence>


            {/* Close Button */}
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              &times;
            </button>
            </div>
            </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

export default RegisterPage
