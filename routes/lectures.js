const express = require('express');
const router = express.Router();
const Lecture = require('../models/Lecture');

// Get all lectures
router.get('/', async (req, res) => {
    try {
        const lectures = await Lecture.find();
        res.json(lectures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single lecture
router.get('/:id', async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }
        res.json(lecture);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new lecture
router.post('/', async (req, res) => {
    try {
        const { title, content, videoUrl, duration, courseId } = req.body;
        
        const lecture = new Lecture({
            title,
            content,
            videoUrl,
            duration,
            courseId
        });

        await lecture.save();
        res.status(201).json(lecture);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Mark lecture as completed
router.post('/:id/complete', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        // Add completion to lecture
        if (!lecture.completions.includes(req.session.userId)) {
            lecture.completions.push(req.session.userId);
            await lecture.save();
        }

        res.json({ message: 'Lecture marked as completed', lecture });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 