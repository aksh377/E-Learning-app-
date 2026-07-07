const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const instructors = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'instructor'
    },
    {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: 'instructor'
    },
    {
        name: 'Robert Johnson',
        email: 'robert.johnson@example.com',
        password: 'password123',
        role: 'instructor'
    }
];

async function createInstructors() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Learningapp');
        console.log('Connected to MongoDB');

        // Create instructors
        for (const instructor of instructors) {
            // Check if instructor already exists
            const existingInstructor = await User.findOne({ email: instructor.email });
            if (existingInstructor) {
                console.log(`Instructor ${instructor.name} already exists`);
                continue;
            }

            // Create new instructor
            const newInstructor = new User(instructor);
            await newInstructor.save();
            console.log(`Created instructor: ${instructor.name}`);
        }

        console.log('All instructors created successfully');
    } catch (error) {
        console.error('Error creating instructors:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
    }
}

createInstructors(); 