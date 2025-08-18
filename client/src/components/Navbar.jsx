import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">SkillSwap</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`${isActive('/') ? 'text-primary-600' : 'text-gray-700'} hover:text-primary-600 transition-colors`}
            >
              Home
            </Link>
            <Link 
              to="/skills" 
              className={`${isActive('/skills') ? 'text-primary-600' : 'text-gray-700'} hover:text-primary-600 transition-colors`}
            >
              Browse Skills
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`${isActive('/dashboard') ? 'text-primary-600' : 'text-gray-700'} hover:text-primary-600 transition-colors`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/my-skills" 
                  className={`${isActive('/my-skills') ? 'text-primary-600' : 'text-gray-700'} hover:text-primary-600 transition-colors`}
                >
                  My Skills
                </Link>
                <Link 
                  to="/requests" 
                  className={`${isActive('/requests') ? 'text-primary-600' : 'text-gray-700'} hover:text-primary-600 transition-colors`}
                >
                  Requests
                </Link>
                <Link 
                  to="/messages" 
                  className={`${isActive('/messages') ? 'text-primary-600' : 'text-gray-700'} hover:text-primary-600 transition-colors flex items-center space-x-1`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Messages</span>
                  {/* Notification badge - uncomment when you have unread message count */}
                  {/* <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span> */}
                </Link>
              </>
            ) : null}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">Welcome, {user.name}</span>
                <Link 
                  to="/profile" 
                  className={`${isActive('/profile') ? 'text-primary-600' : 'text-gray-700'} hover:text-primary-600 transition-colors`}
                >
                  Profile
                </Link>
                <button 
                  onClick={logout}
                  className="btn-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
