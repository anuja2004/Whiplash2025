import React from 'react'
import RegisterPage from './pages/register';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/register' element={
            <RegisterPage/>
          } />
        </Routes>
      </Router>
    </div>
  )
}

export default App