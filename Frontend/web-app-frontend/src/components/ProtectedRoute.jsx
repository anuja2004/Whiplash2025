// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {

    // write logic later

    //   const isAuthenticated = localStorage.getItem('user') // or however you track login

//   if (!isAuthenticated) {
//     return <Navigate to="/register" replace />
//   }

  return children
}

export default ProtectedRoute
