import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Award, 
  BookOpen, 
  Users, 
  MessageSquare,
  Camera,
  Globe,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);

  // Mock user data - replace with actual user data
  const [userData, setUserData] = useState({
    _id: '123',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Passionate full-stack developer with 8+ years of experience. I love sharing knowledge and helping others grow in their tech careers.',
    avatar: '/api/placeholder/150/150',
    joinDate: '2023-01-15',
    website: 'https://janesmith.dev',
    github: 'janesmith',
    linkedin: 'jane-smith-dev',
    twitter: 'janesmith_dev'
  });

  const [skills, setSkills] = useState([
    { _id: '1', name: 'React', level: 'Expert', category: 'Frontend', endorsements: 12 },
    { _id: '2', name: 'Node.js', level: 'Advanced', category: 'Backend', endorsements: 8 },
    { _id: '3', name: 'UI/UX Design', level: 'Intermediate', category: 'Design', endorsements: 15 },
    { _id: '4', name: 'Python', level: 'Advanced', category: 'Backend', endorsements: 6 },
    { _id: '5', name: 'MongoDB', level: 'Advanced', category: 'Database', endorsements: 4 }
  ]);

  const [stats] = useState({
    totalSkills: 5,
    totalEndorsements: 45,
    mentoringSessions: 23,
    requestsReceived: 12,
    requestsSent: 8
  });

  const [reviews] = useState([
    {
      _id: '1',
      from: { name: 'John Doe', avatar: '/api/placeholder/40/40' },
      rating: 5,
      comment: 'Jane is an excellent mentor! She helped me understand React concepts clearly.',
      skill: 'React',
      date: '2024-01-10'
    },
    {
      _id: '2',
      from: { name: 'Mike Johnson', avatar: '/api/placeholder/40/40' },
      rating: 5,
      comment: 'Great teacher with lots of patience. Highly recommend for UI/UX guidance.',
      skill: 'UI/UX Design',
      date: '2024-01-05'
    }
  ]);

  const handleSave = () => {
    // Save user data to backend
    setIsEditing(false);
  };

  const handleAddSkill = (newSkill) => {
    setSkills([...skills, { ...newSkill, _id: Date.now().toString(), endorsements: 0 }]);
    setShowAddSkillModal(false);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Expert':
        return 'bg-green-100 text-green-800';
      case 'Advanced':
        return 'bg-blue-100 text-blue-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Beginner':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const AddSkillModal = () => {
    const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner', category: '' });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Add New Skill</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., JavaScript, Figma, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select category</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Design">Design</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="Mobile">Mobile</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddSkillModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAddSkill(newSkill)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={!newSkill.name || !newSkill.category}
            >
              Add Skill
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:shadow-lg">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                        className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                    )}
                    <p className="text-gray-600">Member since {new Date(userData.joinDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    <span>{isEditing ? 'Save' : 'Edit Profile'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <span>{userData.email}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <span>{userData.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.location}
                        onChange={(e) => setUserData({...userData, location: e.target.value})}
                        className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <span>{userData.location}</span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 mb-4">
                  <a href={userData.website} className="text-blue-600 hover:text-blue-800">
                    <Globe className="w-5 h-5" />
                  </a>
                  <a href={`https://github.com/${userData.github}`} className="text-gray-600 hover:text-gray-800">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href={`https://linkedin.com/in/${userData.linkedin}`} className="text-blue-600 hover:text-blue-800">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href={`https://twitter.com/${userData.twitter}`} className="text-blue-400 hover:text-blue-600">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>

                {isEditing ? (
                  <textarea
                    value={userData.bio}
                    onChange={(e) => setUserData({...userData, bio: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md h-20 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-700">{userData.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalSkills}</p>
            <p className="text-sm text-gray-600">Skills</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalEndorsements}</p>
            <p className="text-sm text-gray-600">Endorsements</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.mentoringSessions}</p>
            <p className="text-sm text-gray-600">Sessions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <MessageSquare className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.requestsReceived}</p>
            <p className="text-sm text-gray-600">Received</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <MessageSquare className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.requestsSent}</p>
            <p className="text-sm text-gray-600">Sent</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'skills'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Skills ({skills.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'about' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">About Me</h3>
                <p className="text-gray-700 leading-relaxed">{userData.bio}</p>
              </div>
            )}

            {activeTab === 'skills' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">My Skills</h3>
                  <button
                    onClick={() => setShowAddSkillModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill) => (
                    <div key={skill._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                          <p className="text-sm text-gray-600">{skill.category}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{skill.endorsements} endorsements</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Reviews & Feedback</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{review.from.name}</h4>
                            <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-600">for {review.skill}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showAddSkillModal && <AddSkillModal />}
      </div>
    </div>
  );
};

export default Profile;