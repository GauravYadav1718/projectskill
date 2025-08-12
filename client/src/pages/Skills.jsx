import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Star, Users, Clock, ChevronDown, BookOpen, Award, Loader2, X, Send, User, Calendar, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';

const Skills = () => {
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
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState(null);

  // API base URL - adjust this to match your backend
  const API_BASE_URL = 'https://projectskill-1.onrender.com/api/skills';
  const AUTH_API_URL = 'https://projectskill-1.onrender.com/api/auth';
  const REQUEST_API_URL = 'https://projectskill-1.onrender.com/api/requests';

  const categories = ['all', 'Frontend', 'UI/UX Design', 'AI/ML', 'Backend', 'Cybersecurity', 'Java', 'DSA', 'Other'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  // Notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Get current user from localStorage or API
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        console.log('Current user fetched:', user); // Debug log
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Fetch skills from API
  const fetchSkills = async (search = '', category = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);
      
      const url = `${API_BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Skills fetched:', data); // Debug log
      setSkills(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced isOwner function with better debugging
  const isOwner = useCallback((skill) => {
    if (!currentUser || !skill) {
      console.log('isOwner check: No current user or skill', { currentUser, skill });
      return false;
    }

    // Handle different possible structures of skill.user
    const skillUserId = skill.user?._id || skill.user?.id || skill.user || skill.userId;
    const currentUserId = currentUser._id || currentUser.id;

    // Convert both to strings for comparison (in case one is ObjectId and other is string)
    const skillUserIdStr = String(skillUserId);
    const currentUserIdStr = String(currentUserId);

    console.log('isOwner check:', {
      currentUserId,
      skillUserId,
      currentUserIdStr,
      skillUserIdStr,
      skillUser: skill.user,
      isOwner: currentUserIdStr === skillUserIdStr,
      skillObject: skill
    });

    return currentUserIdStr === skillUserIdStr;
  }, [currentUser]);

  // Send request to skill owner - Enhanced with better validation
  const sendRequest = async () => {
    console.log('=== SEND REQUEST DEBUG ===');
    console.log('Current user:', currentUser);
    console.log('Selected skill:', selectedSkill);
    
    if (!currentUser || !selectedSkill) {
      console.log('Missing user or skill');
      showNotification('Please log in to send a request.', 'error');
      return;
    }

    // Enhanced ownership check
    const ownershipCheck = isOwner(selectedSkill);
    console.log('Ownership check result:', ownershipCheck);
    
    if (ownershipCheck) {
      console.log('User is owner - blocking request');
      showNotification('You cannot send a request to your own skill.', 'error');
      return;
    }

    if (!requestMessage.trim()) {
      console.log('No message provided');
      showNotification('Please enter a message before sending the request.', 'error');
      return;
    }

    try {
      setRequestLoading(true);
      const token = localStorage.getItem('token');

      // Enhanced payload construction with better validation
      const skillUserId = selectedSkill?.user?._id || selectedSkill?.user?.id || selectedSkill?.user || selectedSkill?.userId;
      const currentUserId = currentUser._id || currentUser.id;
      
      console.log('ID comparison:', {
        skillUserId,
        currentUserId,
        skillUserIdStr: String(skillUserId),
        currentUserIdStr: String(currentUserId),
        areEqual: String(skillUserId) === String(currentUserId)
      });
      
      const payload = {
        to: skillUserId,
        skill: selectedSkill?._id || selectedSkill?.id,
        message: requestMessage.trim(),
      };

      console.log('Sending request payload:', payload);

      if (!payload.to || !payload.skill) {
        console.log('Invalid payload');
        showNotification('Invalid skill or user information.', 'error');
        return;
      }

      // Triple-check ownership before sending using string comparison
      if (String(payload.to) === String(currentUserId)) {
        console.log('Final ownership check failed - user trying to send to themselves');
        showNotification('You cannot send a request to yourself.', 'error');
        return;
      }

      console.log('All checks passed - sending request');

      const response = await fetch(REQUEST_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        showNotification('Request sent successfully!', 'success');
        setShowRequestForm(false);
        setRequestMessage('');
        setShowModal(false);
        console.log('Request sent:', result);
      } else {
        const errorData = await response.json();
        console.error('Request Error:', errorData);
        showNotification(`${errorData.message || errorData.errors?.[0]?.msg || 'Request failed'}`, 'error');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      showNotification('Error sending request. Please try again.', 'error');
    } finally {
      setRequestLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSkills();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchSkills(searchTerm, selectedCategory);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedCategory]);

  // Client-side filtering and sorting
  const filteredSkills = useMemo(() => {
    let filtered = [...skills];

    // Filter by level (client-side since API doesn't support level filtering)
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(skill => skill.level === selectedLevel);
    }

    // Sort the results
    return filtered.sort((a, b) => {
      if (sortBy === 'popular') {
        // Sort by creation date (newest first) as a proxy for popularity
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'rating') {
        // If you have rating field, use it; otherwise use creation date
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [skills, selectedLevel, sortBy]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleRequestMessageChange = useCallback((e) => {
    setRequestMessage(e.target.value);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const openSkillModal = (skill) => {
    console.log('Opening skill modal for:', skill); // Debug log
    setSelectedSkill(skill);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowRequestForm(false);
    setSelectedSkill(null);
    setRequestMessage('');
  };

  const openRequestForm = () => {
    console.log('=== OPEN REQUEST FORM DEBUG ===');
    console.log('Current user:', currentUser);
    console.log('Selected skill:', selectedSkill);
    
    // Additional check before opening request form
    const ownershipCheck = isOwner(selectedSkill);
    console.log('Ownership check in openRequestForm:', ownershipCheck);
    
    if (ownershipCheck) {
      console.log('Blocking request form - user is owner');
      showNotification('You cannot send a request to your own skill.', 'error');
      return;
    }
    
    console.log('Opening request form');
    setShowRequestForm(true);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Enhanced validation function
  const canSendRequest = useCallback(() => {
    const hasUser = !!currentUser;
    const hasSkill = !!selectedSkill;
    const hasMessage = !!requestMessage.trim();
    const notOwner = !isOwner(selectedSkill);
    
    console.log('canSendRequest check:', {
      hasUser,
      hasSkill,
      hasMessage,
      notOwner,
      canSend: hasUser && hasSkill && hasMessage && notOwner
    });
    
    return hasUser && hasSkill && hasMessage && notOwner;
  }, [currentUser, selectedSkill, requestMessage, isOwner]);

  // Notification Component
  const NotificationComponent = () => {
    if (!notification) return null;

    const isError = notification.type === 'error';
    const bgColor = isError ? 'bg-red-50' : 'bg-green-50';
    const borderColor = isError ? 'border-red-200' : 'border-green-200';
    const textColor = isError ? 'text-red-800' : 'text-green-800';
    const iconColor = isError ? 'text-red-500' : 'text-green-500';
    const Icon = isError ? AlertCircle : CheckCircle;

    return (
      <div className={`fixed top-4 right-4 z-50 max-w-md w-full ${bgColor} ${borderColor} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out`}>
        <div className="flex items-start">
          <Icon className={`h-5 w-5 ${iconColor} mt-0.5 mr-3 flex-shrink-0`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${textColor}`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className={`ml-4 ${textColor} hover:opacity-70 transition-opacity`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const SkillCard = ({ skill }) => {
    const isUserOwner = isOwner(skill);
    
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden group">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{getSkillEmoji(skill.category)}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {skill.title}
                  {isUserOwner && <span className="ml-2 text-sm text-blue-600 font-medium">(Your Skill)</span>}
                </h3>
                <p className="text-sm text-gray-600">
                  by {skill.user?.name || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {skill.rating || 'N/A'}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {skill.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {skill.category}
            </span>
            {skill.level && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {skill.level}
              </span>
            )}
            {isUserOwner && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Your Skill
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(skill.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="h-4 w-4" />
              <span className="capitalize">{skill.level || 'N/A'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              ID: {skill._id?.slice(-6) || 'N/A'}
            </div>
            <button 
              onClick={() => openSkillModal(skill)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SkillModal = () => {
    if (!selectedSkill) return null;

    const isUserOwner = isOwner(selectedSkill);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Skill Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{getSkillEmoji(selectedSkill.category)}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedSkill.title}
                    {isUserOwner && <span className="ml-2 text-sm text-blue-600 font-medium">(Your Skill)</span>}
                  </h3>
                  <p className="text-gray-600">Category: {selectedSkill.category}</p>
                  {selectedSkill.level && (
                    <p className="text-gray-600">Level: {selectedSkill.level}</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedSkill.description}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Instructor</h4>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{selectedSkill.user?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Posted on {formatDate(selectedSkill.createdAt)}</span>
                </div>
              </div>

              {!showRequestForm && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Close
                  </button>
                  {currentUser && !isUserOwner && (
                    <button
                      onClick={openRequestForm}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send Request</span>
                    </button>
                  )}
                  {isUserOwner && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800 font-medium">You are the instructor of this skill</span>
                    </div>
                  )}
                  {!currentUser && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <span className="text-sm text-gray-600">Please log in to send a request</span>
                    </div>
                  )}
                </div>
              )}

              {showRequestForm && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Send Request to {selectedSkill.user?.name}</span>
                  </h4>
                  <textarea
                    value={requestMessage}
                    onChange={handleRequestMessageChange}
                    placeholder="Write your request message here... (e.g., I'd like to learn this skill, when are you available?)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
                    autoFocus
                    onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                  />
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => {
                        setShowRequestForm(false);
                        setRequestMessage('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendRequest}
                      disabled={requestLoading || !canSendRequest()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      {requestLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading skills...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <BookOpen className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading skills</h3>
              <p className="text-gray-600">{error}</p>
            </div>
            <button 
              onClick={() => fetchSkills(searchTerm, selectedCategory)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <NotificationComponent />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Skills</h1>
          <p className="text-gray-600">Discover and learn new skills from expert instructors</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills, topics, or descriptions..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="popular">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              
              <button
                onClick={toggleFilters}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={selectedLevel}
                    onChange={handleLevelChange}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>
                        {level === 'all' ? 'All Levels' : level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredSkills.length} skills
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </p>
        </div>

        {filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map(skill => (
              <SkillCard key={skill._id} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>

      {showModal && <SkillModal />}
    </div>
  );
};

export default Skills;
