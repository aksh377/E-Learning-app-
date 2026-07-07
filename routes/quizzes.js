const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

// Get all quizzes
router.get('/', async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single quiz
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new quiz
router.post('/', async (req, res) => {
    try {
        const { title, questions, duration, courseId } = req.body;
        
        const quiz = new Quiz({
            title,
            questions,
            duration,
            courseId
        });

        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Submit quiz
router.post('/:id/submit', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate score
        const answers = req.body.answers;
        let score = 0;
        
        for (let i = 0; i < quiz.questions.length; i++) {
            if (answers[i] === quiz.questions[i].correctAnswer) {
                score++;
            }
        }

        // Add submission to quiz
        quiz.submissions.push({
            userId: req.session.userId,
            answers: answers,
            score: score,
            submittedAt: new Date()
        });

        await quiz.save();
        res.json({ 
            message: 'Quiz submitted successfully', 
            score: score,
            totalQuestions: quiz.questions.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 