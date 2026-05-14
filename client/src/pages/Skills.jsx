import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Star, Users, Clock, ChevronDown, BookOpen, Award, Loader2, X, Send, User, Calendar, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Skills = () => {
  const { user: currentUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const categories = ['all', 'Frontend', 'UI/UX Design', 'AI/ML', 'Backend', 'Cybersecurity', 'Java', 'DSA', 'Other'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  // Notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch skills from API
  const fetchSkills = async (search = '', category = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'all') params.category = category;
      
      const response = await axios.get('/api/skills', { params });
      setSkills(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = useCallback((skill) => {
    if (!currentUser || !skill) return false;
    const skillUserId = skill.user?._id || skill.user?.id || skill.user || skill.userId;
    const currentUserId = currentUser._id || currentUser.id;
    return String(skillUserId) === String(currentUserId);
  }, [currentUser]);

  const sendRequest = async () => {
    if (!currentUser || !selectedSkill) {
      showNotification('Please log in to send a request.', 'error');
      return;
    }

    if (isOwner(selectedSkill)) {
      showNotification('You cannot send a request to your own skill.', 'error');
      return;
    }

    if (!requestMessage.trim()) {
      showNotification('Please enter a message before sending the request.', 'error');
      return;
    }

    try {
      setRequestLoading(true);
      const skillUserId = selectedSkill?.user?._id || selectedSkill?.user?.id || selectedSkill?.user || selectedSkill?.userId;
      
      const payload = {
        to: skillUserId,
        skill: selectedSkill?._id || selectedSkill?.id,
        message: requestMessage.trim(),
      };

      const response = await axios.post('/api/requests', payload);

      if (response.status === 200 || response.status === 201) {
        showNotification('Request sent successfully!', 'success');
        setShowRequestForm(false);
        setRequestMessage('');
        setShowModal(false);
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error sending request.', 'error');
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchSkills(searchTerm, selectedCategory);
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedCategory]);

  const filteredSkills = useMemo(() => {
    let filtered = [...skills];
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(skill => skill.level === selectedLevel);
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'popular') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [skills, selectedLevel, sortBy]);

  const openSkillModal = (skill) => {
    setSelectedSkill(skill);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowRequestForm(false);
    setSelectedSkill(null);
    setRequestMessage('');
  };

  const getSkillEmoji = (category) => {
    const emojiMap = {
      'Frontend': '🚀',
      'UI/UX Design': '🎨',
      'AI/ML': '🤖',
      'Backend': '⚙️',
      'Cybersecurity': '🔐',
      'Java': '☕',
      'DSA': '🧮',
      'Other': '💡'
    };
    return emojiMap[category] || '📚';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-24 right-6 z-[100] max-w-md w-full glass-card p-4 border-l-4 ${
          notification.type === 'error' ? 'border-red-500' : 'border-green-500'
        } animate-float shadow-2xl`}>
          <div className="flex items-center space-x-3">
            {notification.type === 'error' ? <AlertCircle className="text-red-500" /> : <CheckCircle className="text-green-500" />}
            <p className="font-semibold text-slate-800">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Explore Skills</h1>
          <p className="text-lg text-slate-500 font-medium">Connect with experts and start your learning journey today.</p>
        </div>

        {/* Search & Filters */}
        <div className="glass-card p-6 mb-12 border-white/40 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by skill, topic, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input !pl-12 !py-4"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input !w-auto min-w-[180px] !py-3"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline !py-3 flex items-center space-x-2 ${showFilters ? 'border-primary-500 bg-primary-50 text-primary-600' : ''}`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input !w-auto !py-3"
              >
                <option value="popular">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="alphabetical">A - Z</option>
              </select>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty Level</label>
                <div className="flex gap-2">
                  {levels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedLevel === level 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-500 hover:text-primary-600'
                      }`}
                    >
                      {level === 'all' ? 'All' : level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            <p className="text-slate-500 font-bold animate-pulse">Fetching the best skills for you...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 glass-card border-red-100">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Couldn't load skills</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">{error}</p>
            <button 
              onClick={() => fetchSkills()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSkills.map(skill => (
              <div 
                key={skill._id} 
                className="glass-card group hover:scale-[1.02] transition-all duration-300 flex flex-col h-full"
              >
                <div className="p-8 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-primary-50 transition-colors">
                      {getSkillEmoji(skill.category)}
                    </div>
                    <div className="flex items-center space-x-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-bold text-yellow-700">
                        {skill.rating || '4.8'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                        {skill.category}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary-600 bg-secondary-50 px-2 py-1 rounded-md">
                        {skill.level || 'Intermediate'}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight">
                      {skill.title}
                    </h3>
                    
                    <p className="text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                      {skill.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center border border-slate-200">
                        <User className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-slate-900">{skill.user?.name || 'Instructor'}</p>
                        <p className="text-slate-500">{formatDate(skill.createdAt)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => openSkillModal(skill)}
                      className="btn-outline !py-2 !px-4 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass-card">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No skills matched your search</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Try broadening your filters or searching for something else.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedSkill && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="glass-card !bg-white max-w-2xl w-full relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-2 bg-gradient-to-r from-primary-600 to-secondary-500"></div>
            <div className="p-8 sm:p-10">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  <div className="text-5xl">{getSkillEmoji(selectedSkill.category)}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 leading-tight">{selectedSkill.title}</h2>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm font-bold text-primary-600">{selectedSkill.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm font-bold text-secondary-600">{selectedSkill.level || 'Expert'}</span>
                    </div>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">About this skill</h4>
                  <p className="text-lg text-slate-700 leading-relaxed">{selectedSkill.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Instructor</h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="font-bold text-slate-900">{selectedSkill.user?.name || 'Professional'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Published</h4>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="font-bold text-slate-900">{formatDate(selectedSkill.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {showRequestForm ? (
                  <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary-600 flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Message to Instructor</span>
                    </h4>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Hi! I'm really interested in learning this. Here's what I want to achieve..."
                      className="form-input h-32"
                      autoFocus
                    />
                    <div className="flex gap-4 pt-2">
                      <button
                        onClick={() => setShowRequestForm(false)}
                        className="btn-outline flex-1"
                      >
                        Back
                      </button>
                      <button
                        onClick={sendRequest}
                        disabled={requestLoading || !requestMessage.trim()}
                        className="btn-primary flex-[2] flex items-center justify-center space-x-2"
                      >
                        {requestLoading ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
                        <span>{requestLoading ? 'Sending...' : 'Send Request'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 pt-4">
                    {isOwner(selectedSkill) ? (
                      <div className="w-full bg-primary-50 border border-primary-100 p-4 rounded-xl flex items-center justify-center space-x-2 text-primary-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-bold">You are the instructor of this skill</span>
                      </div>
                    ) : currentUser ? (
                      <button
                        onClick={() => setShowRequestForm(true)}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center space-x-3 shadow-xl shadow-primary-500/20"
                      >
                        <Send className="h-5 w-5" />
                        <span>Start Exchange</span>
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="btn-primary w-full py-4 text-lg text-center"
                      >
                        Sign in to Exchange
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;

