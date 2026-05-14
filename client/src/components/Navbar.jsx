import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold gradient-text">SkillSwap</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/skills" 
              className={`nav-link ${isActive('/skills') ? 'nav-link-active' : ''}`}
            >
              Browse
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/my-skills" 
                  className={`nav-link ${isActive('/my-skills') ? 'nav-link-active' : ''}`}
                >
                  My Skills
                </Link>
                <Link 
                  to="/requests" 
                  className={`nav-link ${isActive('/requests') ? 'nav-link-active' : ''}`}
                >
                  Requests
                </Link>
                <Link 
                  to="/messages" 
                  className={`nav-link flex items-center space-x-1 ${isActive('/messages') ? 'nav-link-active' : ''}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Messages</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link to="/profile" className="hidden sm:flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <span className="text-sm font-bold text-slate-600">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-slate-700 font-medium">{user.name}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="btn-outline !py-2 !px-4 text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-slate-600 font-medium hover:text-primary-600 transition-colors px-4 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary shadow-lg shadow-primary-500/20">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
