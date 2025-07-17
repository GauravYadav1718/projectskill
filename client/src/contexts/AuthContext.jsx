import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messageStats, setMessageStats] = useState({ total: 0, sent: 0, received: 0 })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data.user)
      await fetchMessageStats()
    } catch (error) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      await fetchMessageStats()
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      setMessageStats({ total: 0, sent: 0, received: 0 })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setMessageStats({ total: 0, sent: 0, received: 0 })
  }

  const fetchMessageStats = async () => {
    try {
      const response = await axios.get('/api/messages/count')
      setMessageStats(response.data)
    } catch (error) {
      console.error('Error fetching message stats:', error)
    }
  }

  const sendMessage = async (receiverEmail, content) => {
    try {
      const response = await axios.post('/api/messages/send', {
        receiverEmail,
        content
      })
      
      await fetchMessageStats()
      
      return { success: true, message: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send message'
      }
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations')
      return { success: true, conversations: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch conversations'
      }
    }
  }

  const fetchMessages = async (userEmail, page = 1, limit = 50) => {
    try {
      const response = await axios.get(`/api/messages/conversations/${userEmail}/messages`, {
        params: { page, limit }
      })
      return { success: true, messages: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch messages'
      }
    }
  }

  const searchMessages = async (query, userEmail = null) => {
    try {
      const params = { q: query }
      if (userEmail) params.userEmail = userEmail
      
      const response = await axios.get('/api/messages/search', { params })
      return { success: true, messages: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search messages'
      }
    }
  }

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/messages/${messageId}`)
      await fetchMessageStats()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete message'
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    messageStats,
    fetchMessageStats,
    sendMessage,
    fetchConversations,
    fetchMessages,
    searchMessages,
    deleteMessage
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}