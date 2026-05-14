import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Search, User, MessageCircle, Clock, Trash2, ArrowLeft, MoreVertical, Loader2, Sparkles, Mail } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Message = () => {
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newReceiverEmail, setNewReceiverEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations on component mount and handle URL params
  useEffect(() => {
    const initMessaging = async () => {
      const convs = await loadConversations();
      
      // Check for query params
      const params = new URLSearchParams(location.search);
      const userId = params.get('userId');
      const userName = params.get('userName');
      const userEmail = params.get('userEmail');

      if (userId && userName) {
        // Find if conversation already exists in the updated list
        const existingConv = convs.find(c => c.participant._id === userId);
        if (existingConv) {
          handleConversationSelect(existingConv);
        } else {
          // Select the "virtual" conversation that was added via loadConversations
          const virtualConv = {
            _id: 'temp-' + userId,
            participant: { _id: userId, name: userName, email: userEmail },
            isTemp: true
          };
          setSelectedConversation(virtualConv);
        }
      }
    };
    
    initMessaging();
  }, [location.search]);

  const loadConversations = async () => {
    try {
      const [convRes, requestsRes] = await Promise.all([
        axios.get('/api/messages/conversations'),
        axios.get('/api/requests')
      ]);
      
      let allConvs = [...convRes.data];
      
      // Add users from accepted requests if they don't have a conversation yet
      const acceptedRequests = [
        ...(requestsRes.data.sent || []),
        ...(requestsRes.data.received || [])
      ].filter(r => r.status === 'accepted');
      
      acceptedRequests.forEach(req => {
        const otherUser = req.from?._id === currentUser?._id ? req.to : req.from;
        if (otherUser && !allConvs.some(c => c.participant?._id === otherUser._id)) {
          allConvs.push({
            _id: 'request-' + req._id,
            participant: otherUser,
            lastMessage: { content: `Accepted request for: ${req.skill?.title || 'Skill'}`, timestamp: req.updatedAt },
            isFromRequest: true
          });
        }
      });
      
      // Sort by timestamp
      allConvs.sort((a, b) => {
        const timeA = new Date(a.lastMessage?.timestamp || 0).getTime();
        const timeB = new Date(b.lastMessage?.timestamp || 0).getTime();
        return timeB - timeA;
      });

      setConversations(allConvs);
      return allConvs;
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
      return [];
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
    setMessagesLoading(true);
    
    try {
      const response = await axios.get(`/api/messages/conversations/${conversation.participant._id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const receiverEmail = selectedConversation ? selectedConversation.participant.email : newReceiverEmail;
    if (!receiverEmail) return;

    setLoading(true);

    try {
      const response = await axios.post('/api/messages/send', {
        receiverEmail: receiverEmail,
        content: newMessage
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        const updatedConvs = await loadConversations();
        
        // If we were in a temporary or request-based conversation, switch to the real one
        if (!selectedConversation || selectedConversation.isTemp || selectedConversation.isFromRequest) {
          const foundConv = updatedConvs.find(conv => conv.participant.email === receiverEmail);
          if (foundConv) setSelectedConversation(foundConv);
        }

        setNewMessage('');
        setNewReceiverEmail('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    <div className="h-[calc(100-72px)] flex bg-[#f8fafc] overflow-hidden">
      {/* Sidebar - Conversations */}
      <div className={`w-full md:w-96 bg-white border-r border-slate-200 flex flex-col transition-all ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Messages</h2>
            <div className="p-2 bg-primary-50 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="form-input !pl-11 !py-2.5 !text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-900 font-bold">No messages yet</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Your skill exchange chats will appear here.</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation._id}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                  selectedConversation?._id === conversation._id 
                    ? 'bg-primary-50 shadow-sm' 
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => handleConversationSelect(conversation)}
              >
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-lg ${
                  selectedConversation?._id === conversation._id ? 'bg-primary-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {conversation.participant?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-bold truncate ${
                      selectedConversation?._id === conversation._id ? 'text-primary-900' : 'text-slate-900'
                    }`}>
                      {conversation.participant?.name || 'Unknown User'}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">
                      {formatTime(conversation.lastMessage?.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate font-medium">
                    {conversation.lastMessage?.content || 'Started a conversation'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white transition-all ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {selectedConversation.participant?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none mb-1">
                    {selectedConversation.participant?.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]/50">
              {messagesLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Securing chat...</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.sender?._id === currentUser._id || message.sender === currentUser._id || message.sender?.email === currentUser.email;
                  
                  return (
                    <div
                      key={message._id || index}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-[70%]`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                          isCurrentUser 
                            ? 'bg-primary-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed">{message.content}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 mt-2 px-1 uppercase tracking-tighter">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="form-input !py-3 !pr-12"
                    disabled={loading}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="btn-primary !p-3 aspect-square flex items-center justify-center shadow-lg shadow-primary-500/20"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f8fafc]/30">
            <div className="max-w-md w-full text-center">
              <div className="w-24 h-24 bg-white rounded-[40px] shadow-2xl flex items-center justify-center mx-auto mb-8 border border-white">
                <MessageCircle className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                Secure Messaging
              </h3>
              <p className="text-slate-500 font-medium mb-12">
                Connect with mentors and mentees in a professional workspace.
              </p>
              
              <div className="glass-card !bg-white p-8 border-white/40 shadow-2xl">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary-600" />
                  <span>Start New Conversation</span>
                </h4>
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                    <input
                      type="email"
                      placeholder="Recipient Email Address"
                      value={newReceiverEmail}
                      onChange={(e) => setNewReceiverEmail(e.target.value)}
                      className="form-input !pl-11 !text-sm"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Write your opening message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="form-input h-32 !text-sm"
                    required
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim() || !newReceiverEmail.trim()}
                    className="btn-primary w-full py-4 shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>{loading ? 'Sending...' : 'Initialize Chat'}</span>
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