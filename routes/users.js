const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all instructors
router.get('/instructors', async (req, res) => {
    try {
        const instructors = await User.find({ role: 'instructor' })
            .select('_id name email');
        
        res.json(instructors);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ message: 'Error fetching instructors' });
    }
});

module.exports = router; 