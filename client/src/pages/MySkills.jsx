// MySkills.jsx (Updated with Add Skill Modal and Improved Add Logic)

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Plus, Edit, Trash2, Eye, EyeOff, Code, Palette, Database, Cloud, ShieldAlert, Coffee, Braces, Settings, BookOpen, Award, Users, Clock, Target, TrendingUp, Search
} from 'lucide-react';

const categories = [
  { name: 'Frontend', icon: Code, color: 'bg-blue-500' },
  { name: 'UI/UX Design', icon: Palette, color: 'bg-pink-500' },
  { name: 'AI/ML', icon: Cloud, color: 'bg-green-500' },
  { name: 'Backend', icon: Database, color: 'bg-indigo-500' },
  { name: 'Cybersecurity', icon: ShieldAlert, color: 'bg-red-500' },
  { name: 'Java', icon: Coffee, color: 'bg-orange-500' },
  { name: 'DSA', icon: Braces, color: 'bg-yellow-500' },
  { name: 'Other', icon: Settings, color: 'bg-gray-500' },
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const MySkills = () => {
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ title: '', description: '', category: 'Frontend', level: 'Beginner' });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await axios.get('/api/skills/my-skills', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSkills(res.data);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/skills/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSkills(skills.filter((skill) => skill._id !== id));
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

  const handleAddSkill = async () => {
    try {
      console.log('Submitting skill:', newSkill);
      const res = await axios.post('/api/skills', newSkill, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Skill added:', res.data);
      setSkills([res.data, ...skills]);
      setShowModal(false);
      setNewSkill({ title: '', description: '', category: 'Frontend', level: 'Beginner' });
    } catch (err) {
      console.error('Add Skill Error:', err.response?.data || err.message);
    }
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.name === category);
    return cat ? cat.icon : Code;
  };

  const getCategoryColor = (category) => {
    const cat = categories.find((c) => c.name === category);
    return cat ? cat.color : 'bg-gray-500';
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-gray-100 text-gray-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || skill.level === filterLevel;
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Skills</h1>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Skill
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
        </select>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Levels</option>
          {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
        </select>
      </div>

      {/* Skills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map(skill => {
          const Icon = getCategoryIcon(skill.category);
          return (
            <div key={skill._id} className="bg-white p-5 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-full ${getCategoryColor(skill.category)}`}>
                  <Icon className="text-white w-5 h-5" />
                </div>
                <div className="flex gap-2">
                  <button><Edit className="w-4 h-4 text-blue-500" /></button>
                  <button onClick={() => handleDelete(skill._id)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
              <h2 className="font-bold text-lg mb-1">{skill.title}</h2>
              <p className="text-sm text-gray-600 mb-2">{skill.category}</p>
              <p className="text-sm text-gray-700 line-clamp-3 mb-2">{skill.description}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded ${getLevelColor(skill.level)}`}>{skill.level}</span>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <BookOpen className="w-10 h-10 mx-auto mb-2" />
          No skills found.
        </div>
      )}

      {/* Add Skill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold">Add New Skill</h2>
            <input
              type="text"
              placeholder="Skill Title"
              value={newSkill.title}
              onChange={(e) => setNewSkill({ ...newSkill, title: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Skill Description"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select
              value={newSkill.level}
              onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="text-gray-600">Cancel</button>
              <button onClick={handleAddSkill} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySkills;
