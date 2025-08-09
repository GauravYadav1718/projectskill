const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();


// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ,
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB Connection
mongoose.connect( process.env.MONGODB_URI || mongodb+srv:gaurav:gaurav123@@cluster0.k0kjrm4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0, {

})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/messages', require('./routes/message'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'SkillSwap API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
