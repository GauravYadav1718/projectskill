import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, User, Search, Filter, Plus, Loader2, AlertCircle, Send, Mail, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Requests = () => {
  const { user: currentUser } = useAuth();
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

  // Fetch requests using axios
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/requests');
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users and skills for the modal
  const fetchUsersAndSkills = async () => {
    try {
      const [usersRes, skillsRes] = await Promise.all([
        axios.get('/api/users').catch(() => ({ data: [] })),
        axios.get('/api/skills').catch(() => ({ data: [] }))
      ]);
      setUsers(usersRes.data);
      setSkills(skillsRes.data);
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
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'accepted': return 'bg-green-50 text-green-700 border-green-100';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const response = await axios.put(`/api/requests/${requestId}`, { status: newStatus });
      
      setRequests(prev => ({
        ...prev,
        received: prev.received.map(req => 
          req._id === requestId ? response.data : req
        )
      }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleSubmitRequest = async () => {
    if (!newRequest.to || !newRequest.skill || !newRequest.message) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);
      const response = await axios.post('/api/requests', newRequest);

      setRequests(prev => ({
        ...prev,
        sent: [response.data, ...prev.sent]
      }));

      setNewRequest({ to: '', skill: '', message: '' });
      setShowNewRequestModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartConversation = (request) => {
    const otherUser = activeTab === 'received' ? request.from : request.to;
    window.location.href = `/messages?userId=${otherUser?._id}&userName=${otherUser?.name}&userEmail=${otherUser?.email}&skillId=${request.skill?._id}&requestId=${request._id}`;
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

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Requests</h1>
            <p className="text-slate-500 font-medium">Manage your incoming and outgoing skill exchange proposals.</p>
          </div>
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="btn-primary flex items-center space-x-2 shadow-xl shadow-primary-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>New Request</span>
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700 font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 transition-colors text-2xl leading-none">×</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-2xl mb-8 w-fit">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'received' 
                ? 'bg-white text-primary-600 shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Received
            {requests.received.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {requests.received.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'sent' 
                ? 'bg-white text-primary-600 shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sent
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-8 border-white/40 shadow-xl flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-4 h-4" />
            <input
              type="text"
              placeholder="Search by skill, name, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input !pl-10 !py-2.5 text-sm"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input !py-2.5 !w-auto text-sm min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
              <p className="text-slate-500 font-bold">Loading your requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="glass-card p-20 text-center border-dashed border-slate-200 bg-transparent">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No requests found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? "We couldn't find any requests matching your filters." 
                  : "You don't have any requests yet. Start exploring skills to connect!"
                }
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request._id} className="glass-card group hover:scale-[1.01] transition-all duration-300">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-tr from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center border border-slate-200">
                        <User className="w-7 h-7 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                          {activeTab === 'received' ? request.from?.name : request.to?.name}
                        </h3>
                        <p className="text-slate-500 font-medium text-sm flex items-center space-x-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{activeTab === 'received' ? request.from?.email : request.to?.email}</span>
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center space-x-2 w-fit ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="uppercase tracking-wider">{request.status}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl p-6 mb-8 border border-slate-100">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Skill Interest:</span>
                      <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
                        {request.skill?.title || request.skill?.description || 'Deleted Skill'}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium italic">
                      "{request.message}"
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4 text-slate-400">
                      <div className="flex items-center space-x-1.5 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      {request.status === 'pending' && activeTab === 'received' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(request._id, 'rejected')}
                            className="btn-outline !py-2 !px-6 !rounded-xl text-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleStatusChange(request._id, 'accepted')}
                            className="btn-primary !py-2 !px-8 !rounded-xl text-sm shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700"
                          >
                            Accept Request
                          </button>
                        </>
                      )}
                      
                      {request.status === 'accepted' && (
                        <button
                          onClick={() => handleStartConversation(request)}
                          className="btn-primary !py-2.5 !px-8 flex items-center space-x-2 shadow-xl shadow-primary-500/20"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowNewRequestModal(false)}></div>
          <div className="glass-card !bg-white max-w-lg w-full relative overflow-hidden animate-in zoom-in duration-300">
            <div className="h-2 bg-gradient-to-r from-primary-600 to-secondary-500"></div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Send New Request</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Select Professional</label>
                  <select 
                    value={newRequest.to}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, to: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Choose a mentor...</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Select Skill</label>
                  <select 
                    value={newRequest.skill}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, skill: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Choose a skill...</option>
                    {skills.map(s => (
                      <option key={s._id} value={s._id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Your Message</label>
                  <textarea 
                    value={newRequest.message}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, message: e.target.value }))}
                    className="form-input h-32"
                    placeholder="Tell them why you want to learn this skill..."
                    maxLength={500}
                  />
                  <p className="text-[10px] font-bold text-slate-400 mt-2 text-right uppercase tracking-widest">
                    {newRequest.message.length} / 500 characters
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowNewRequestModal(false)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    disabled={submitLoading || !newRequest.to || !newRequest.skill || !newRequest.message}
                    className="btn-primary flex-1 shadow-lg shadow-primary-500/20"
                  >
                    {submitLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;

