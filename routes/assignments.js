const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// Get all assignments
router.get('/', async (req, res) => {
    try {
        const assignments = await Assignment.find();
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single assignment
router.get('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new assignment
router.post('/', async (req, res) => {
    try {
        const { title, description, dueDate, courseId } = req.body;
        
        const assignment = new Assignment({
            title,
            description,
            dueDate,
            courseId
        });

        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Submit assignment
router.post('/:id/submit', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Add submission to assignment
        assignment.submissions.push({
            userId: req.session.userId,
            content: req.body.content,
            submittedAt: new Date()
        });

        await assignment.save();
        res.json({ message: 'Assignment submitted successfully', assignment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 