const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const assignmentRoutes = require('./routes/assignments');
const quizRoutes = require('./routes/quizzes');
const userRoutes = require('./routes/users');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);

// Root route - serve main.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Serve main.html for all other routes (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Learningapp')
    .then(() => {
        console.log('Connected to MongoDB');
        console.log('Using DB:', mongoose.connection.name);
        // Start server
        const PORT = process.env.PORT || 5000;
        
        // Check if port is already in use
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Open your browser and navigate to http://localhost:${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
                server.listen(PORT + 1);
            } else {
                console.error('Server error:', err);
            }
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        console.log('Starting server without MongoDB connection...');
        
        // Start server even if MongoDB connection fails
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} (without MongoDB)`);
            console.log(`Open your browser and navigate to http://localhost:${PORT}`);
        });
    }); 