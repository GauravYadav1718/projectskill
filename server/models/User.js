const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // bio: {
  //   type: String,
  //   default: ''
  // },
  // avatar: {
  //   type: String,
  //   default: ''
  // },
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  securityQuestion: {
    type: String,
    enum: [
      'What was your first pet name?',
      'What is your mother\'s maiden name?',
      'What was the name of your elementary school?',
      'In what city were you born?',
      'What is your favorite book?'
    ]
  },
  securityAnswer: {
    type: String,
    select: false
  },
  passwordChangeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password and security answer before saving
userSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    if (this.isModified('securityAnswer')) {
      const salt = await bcrypt.genSalt(10);
      this.securityAnswer = await bcrypt.hash(this.securityAnswer.toLowerCase().trim(), salt);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Compare security answer method
userSchema.methods.compareSecurityAnswer = async function(answer) {
  if (!this.securityAnswer) return false;
  return await bcrypt.compare(answer.toLowerCase().trim(), this.securityAnswer);
};

module.exports = mongoose.model('User', userSchema);
