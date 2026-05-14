import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Plus, Edit, Trash2, Code, Palette, Database, Cloud, ShieldAlert, Coffee, Braces, Settings, BookOpen, User, Calendar, Star, Loader2, X, Search, Filter, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  { name: 'Frontend', icon: Code, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { name: 'UI/UX Design', icon: Palette, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
  { name: 'AI/ML', icon: Cloud, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  { name: 'Backend', icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { name: 'Cybersecurity', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  { name: 'Java', icon: Coffee, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  { name: 'DSA', icon: Braces, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { name: 'Other', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const MySkills = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newSkill, setNewSkill] = useState({ title: '', description: '', category: 'Frontend', level: 'Beginner' });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/skills/my-skills');
      setSkills(res.data);
    } catch (err) {
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await axios.delete(`/api/skills/${id}`);
      setSkills(skills.filter((skill) => skill._id !== id));
      showNotification('Skill deleted successfully');
    } catch (err) {
      showNotification('Error deleting skill', 'error');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.title || !newSkill.description) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    try {
      setSubmitLoading(true);
      const res = await axios.post('/api/skills', newSkill);
      setSkills([res.data, ...skills]);
      setShowModal(false);
      setNewSkill({ title: '', description: '', category: 'Frontend', level: 'Beginner' });
      showNotification('Skill posted successfully!');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error adding skill', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getCategoryData = (category) => {
    return categories.find((c) => c.name === category) || categories[7];
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-slate-100 text-slate-700';
      case 'Intermediate': return 'bg-amber-100 text-amber-700';
      case 'Advanced': return 'bg-primary-100 text-primary-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || skill.level === filterLevel;
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-500/5 blur-[120px] rounded-full"></div>
      </div>

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">My Expertise</h1>
            <p className="text-lg text-slate-500 font-medium">Manage the skills you are offering to the community.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2 shadow-xl shadow-primary-500/20"
          >
            <Plus className="h-5 w-5" />
            <span>Post New Skill</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="glass-card p-4 mb-12 border-white/40 shadow-xl flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Search your skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input !pl-11 !py-2.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-input !py-2.5 !w-auto text-sm min-w-[150px]"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="form-input !py-2.5 !w-auto text-sm min-w-[140px]"
            >
              <option value="all">All Levels</option>
              {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
          </div>
        </div>

        {/* Skills List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            <p className="text-slate-500 font-bold animate-pulse">Loading your skills...</p>
          </div>
        ) : filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSkills.map(skill => {
              const catData = getCategoryData(skill.category);
              const Icon = catData.icon;
              return (
                <div key={skill._id} className="glass-card group hover:scale-[1.02] transition-all duration-300 flex flex-col h-full border border-white/40 shadow-xl overflow-hidden">
                  <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${catData.color.replace('text', 'bg')} w-[40%]`}></div>
                  </div>
                  <div className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-2xl ${catData.bg} ${catData.border} border group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${catData.color}`} />
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-primary-50 rounded-xl text-slate-400 hover:text-primary-600 transition-all border border-transparent hover:border-primary-100">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(skill._id)}
                          className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${getLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{skill.category}</span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight">
                        {skill.title}
                      </h2>
                      
                      <p className="text-slate-600 line-clamp-3 mb-6 text-sm leading-relaxed font-medium">
                        {skill.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold">{formatDate(skill.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                        <span className="text-xs font-bold text-yellow-700">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 glass-card border-dashed border-slate-200 bg-transparent">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No skills found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">You haven't posted any skills yet. Share your expertise with the world!</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Add Your First Skill
            </button>
          </div>
        )}

        {/* Add Skill Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="glass-card !bg-white max-w-lg w-full relative overflow-hidden animate-in zoom-in duration-300">
              <div className="h-2 bg-gradient-to-r from-primary-600 to-secondary-500"></div>
              <form onSubmit={handleAddSkill} className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post New Skill</h2>
                  <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest">Skill Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Advanced React Architecture"
                      value={newSkill.title}
                      onChange={(e) => setNewSkill({ ...newSkill, title: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest">Description</label>
                    <textarea
                      required
                      placeholder="Explain what you can teach and your experience level..."
                      value={newSkill.description}
                      onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                      className="form-input h-32"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest">Category</label>
                      <select
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        className="form-input"
                      >
                        {categories.map(cat => (
                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest">Your Level</label>
                      <select
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                        className="form-input"
                      >
                        {levels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                    <button 
                      type="submit" 
                      disabled={submitLoading}
                      className="btn-primary flex-1 shadow-xl shadow-primary-500/20"
                    >
                      {submitLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Post Skill'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySkills;

