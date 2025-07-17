import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, User, Search, Filter, Plus, Loader2, AlertCircle } from 'lucide-react';

const Requests = () => {
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('received');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);

  // Form state for new request
  const [newRequest, setNewRequest] = useState({
    to: '',
    skill: '',
    message: ''
  });

  // API base URL - adjust according to your setup
  const API_BASE_URL = 'http://localhost:3285/api';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API helper function
  const apiCall = async (url, options = {}) => {
    const token = getAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  // Fetch requests using your API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall('/requests');
      setRequests(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users and skills for the modal
  const fetchUsersAndSkills = async () => {
    try {
      // You'll need to implement these endpoints or adjust based on your existing endpoints
      const [usersData, skillsData] = await Promise.all([
        apiCall('/users').catch(() => []),
        apiCall('/skills').catch(() => [])
      ]);
      setUsers(usersData);
      setSkills(skillsData);
    } catch (err) {
      console.error('Error fetching users/skills:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchUsersAndSkills();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const updatedRequest = await apiCall(`/requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      // Update the request in the state
      setRequests(prev => ({
        ...prev,
        received: prev.received.map(req => 
          req._id === requestId ? updatedRequest : req
        )
      }));
      
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitRequest = async () => {
    // Validation
    if (!newRequest.to || !newRequest.skill || !newRequest.message) {
      setError('Please fill in all fields');
      return;
    }

    if (newRequest.message.length < 1) {
      setError('Message cannot be empty');
      return;
    }

    if (newRequest.message.length > 500) {
      setError('Message must be less than 500 characters');
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);
      
      const createdRequest = await apiCall('/requests', {
        method: 'POST',
        body: JSON.stringify(newRequest)
      });

      // Add the new request to sent requests
      setRequests(prev => ({
        ...prev,
        sent: [createdRequest, ...prev.sent]
      }));

      // Reset form and close modal
      setNewRequest({ to: '', skill: '', message: '' });
      setShowNewRequestModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartConversation = (request) => {
    // Get the other user's ID (mentor or mentee)
    const otherUserId = activeTab === 'received' ? request.from?._id : request.to?._id;
    const otherUserName = activeTab === 'received' ? request.from?.name : request.to?.name;
    
    // Navigate to messages page with user details
    // You can use React Router or your preferred navigation method
    window.location.href = `/messages?userId=${otherUserId}&userName=${otherUserName}&skillId=${request.skill._id}&requestId=${request._id}`;
  };

  const currentRequests = activeTab === 'received' ? requests.received : requests.sent;

  const filteredRequests = currentRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const skillName = request.skill?.title || request.skill?.description || '';
    const fromName = request.from?.name || '';
    const toName = request.to?.name || '';
    const message = request.message || '';
    
    const matchesSearch = 
      skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const NewRequestModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Send New Request</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <select 
              value={newRequest.to}
              onChange={(e) => setNewRequest(prev => ({ ...prev, to: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a mentor</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
            <select 
              value={newRequest.skill}
              onChange={(e) => setNewRequest(prev => ({ ...prev, skill: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a skill</option>
              {skills.map(skill => (
                <option key={skill._id} value={skill._id}>{skill.title || skill.description}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              value={newRequest.message}
              onChange={(e) => setNewRequest(prev => ({ ...prev, message: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain why you want to learn this skill and what you hope to achieve..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {newRequest.message.length}/500 characters
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowNewRequestModal(false);
                setNewRequest({ to: '', skill: '', message: '' });
                setError(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitRequest}
              disabled={submitLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Received ({requests.received.filter(r => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sent ({requests.sent.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by skill, name, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No requests match your filters' 
                  : 'No requests found'
                }
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {activeTab === 'received' ? request.from?.name : request.to?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {activeTab === 'received' ? request.from?.email : request.to?.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activeTab === 'received' ? 'Requesting: ' : 'Requested: '}
                        <span className="font-medium">{request.skill?.title || request.skill?.description}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700">{request.message}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {formatDate(request.createdAt)}
                  </p>
                  
                  <div className="flex space-x-2">
                    {request.status === 'pending' && activeTab === 'received' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(request._id, 'rejected')}
                          className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleStatusChange(request._id, 'accepted')}
                          className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Accept
                        </button>
                      </>
                    )}
                    
                    {request.status === 'accepted' && (
                      <button
                        onClick={() => handleStartConversation(request)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showNewRequestModal && <NewRequestModal />}
      </div>
    </div>
  );
};

export default Requests;