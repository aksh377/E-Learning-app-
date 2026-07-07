const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('instructor', 'name email')
            .populate('students', 'name email');
        
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Get enrolled courses for the current user
router.get('/enrolled', async (req, res) => {
    try {
        // Get student ID from JWT token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const studentId = decoded.userId;

        const courses = await Course.find({ students: studentId })
            .populate('instructor', 'name email')
            .populate('students', 'name email');
        
        res.json(courses);
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Error fetching enrolled courses' });
    }
});

// Get a single course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('students', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Error fetching course' });
    }
});

// Create a new course
router.post('/', async (req, res) => {
    try {
        const { title, description, instructorId } = req.body;
        
        // Check if instructor exists
        const instructor = await User.findById(instructorId);
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        
        // Create new course
        const course = new Course({
            title,
            description,
            instructor: instructorId
        });
        
        await course.save();
        
        // Add course to instructor's teaching courses
        instructor.teachingCourses.push(course._id);
        await instructor.save();
        
        res.status(201).json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Error creating course' });
    }
});

// Update a course
router.put('/:id', async (req, res) => {
    try {
        const { title, description } = req.body;
        
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Update course fields
        if (title) course.title = title;
        if (description) course.description = description;
        
        await course.save();
        
        res.json(course);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Error updating course' });
    }
});

// Delete a course
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Remove course from instructor's teaching courses
        if (course.instructor) {
            const instructor = await User.findById(course.instructor);
            if (instructor) {
                instructor.teachingCourses = instructor.teachingCourses.filter(
                    id => id.toString() !== course._id.toString()
                );
                await instructor.save();
            }
        }
        
        // Remove course from students' enrolled courses
        for (const studentId of course.students) {
            const student = await User.findById(studentId);
            if (student) {
                student.enrolledCourses = student.enrolledCourses.filter(
                    id => id.toString() !== course._id.toString()
                );
                await student.save();
            }
        }
        
        await course.remove();
        
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course' });
    }
});

// Enroll a student in a course
router.post('/:id/enroll', async (req, res) => {
    try {
        // Get student ID from JWT token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const studentId = decoded.userId;
        
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Check if student is already enrolled
        if (course.students.includes(studentId)) {
            return res.status(400).json({ message: 'Student already enrolled in this course' });
        }
        
        // Add student to course
        course.students.push(studentId);
        await course.save();
        
        // Add course to student's enrolled courses
        student.enrolledCourses.push(course._id);
        await student.save();
        
        res.json({ message: 'Student enrolled successfully' });
    } catch (error) {
        console.error('Error enrolling student:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Error enrolling student' });
    }
});

module.exports = router; 