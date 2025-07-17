import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, User, MessageCircle, Clock, Trash2 } from 'lucide-react';

const Message = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newReceiverEmail, setNewReceiverEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({ _id: 'user123', name: 'John Doe', email: 'gybawana@gmail.com' });
  const messagesEndRef = useRef(null);

  // Get auth token from localStorage or context
  const getAuthToken = () => {
    // Try different possible token keys
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('jwt') ||
           localStorage.getItem('accessToken');
  };

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('/api/messages/conversations', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.error('Token invalid or expired');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        console.error('Failed to load conversations:', response.status);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    setLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/messages/conversations/${conversation.participant._id}/messages`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.error('Token invalid or expired');
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Failed to load messages:', response.status);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const receiverEmail = selectedConversation ? selectedConversation.participant.email : newReceiverEmail;
    if (!receiverEmail) return;

    const token = getAuthToken();
    if (!token) {
      alert('Please log in to send messages');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverEmail: receiverEmail,
          content: newMessage
        })
      });

      if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setMessages(prev => [...prev, result.message]);
          await loadConversations();
          
          if (!selectedConversation) {
            const updatedConversations = await fetch('/api/messages/conversations', {
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (updatedConversations.ok) {
              const convData = await updatedConversations.json();
              const newConv = convData.find(conv => conv.participant.email === receiverEmail);
              if (newConv) {
                setSelectedConversation(newConv);
              }
            }
          }

          setNewMessage('');
          if (!selectedConversation) {
            setNewReceiverEmail('');
          }
        } else {
          console.error('Failed to send message:', result.message);
          alert('Failed to send message. Please try again.');
        }
      } else {
        const errorData = await response.json();
        console.error('Error sending message:', errorData);
        alert(errorData.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    const participantName = conversation.participant?.name || '';
    const participantEmail = conversation.participant?.email || '';
    const lastMessageContent = conversation.lastMessage?.content || '';
    
    return participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           participantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
           lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Conversations */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new conversation to see it here</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?._id === conversation._id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleConversationSelect(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.participant?.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessage?.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage?.content || 'No message content'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {conversation.participant?.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedConversation.participant?.name || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.participant?.email || 'No email'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.sender?._id === currentUser._id || message.sender?.email === currentUser.email;
                  
                  return (
                    <div
                      key={message._id || index}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCurrentUser ? 'bg-blue-500 ml-2' : 'bg-gray-400 mr-2'
                        }`}>
                          <User className="h-4 w-4 text-white" />
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`relative px-4 py-2 rounded-2xl shadow-sm ${
                          isCurrentUser 
                            ? 'bg-blue-500 text-white rounded-br-md' 
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}>
                          {/* Message tail */}
                          <div className={`absolute bottom-0 w-3 h-3 ${
                            isCurrentUser 
                              ? 'right-0 bg-blue-500 transform rotate-45 translate-x-1 translate-y-1' 
                              : 'left-0 bg-white border-l border-b border-gray-200 transform rotate-45 -translate-x-1 translate-y-1'
                          }`}></div>
                          
                          <p className="text-sm leading-relaxed">{message.content || 'No content'}</p>
                          
                          {/* Timestamp */}
                          <div className={`flex items-center justify-end mt-1 ${
                            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Welcome to Messages
              </h3>
              <p className="text-gray-600 mb-6">
                Select a conversation to start messaging
              </p>
              
              {/* New Message Form */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md w-full">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Start a new conversation
                </h4>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Recipient email"
                    value={newReceiverEmail}
                    onChange={(e) => setNewReceiverEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                  <textarea
                    placeholder="Your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    required
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim() || !newReceiverEmail.trim()}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    <span>{loading ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;