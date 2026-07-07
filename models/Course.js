
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String
        ,
        required: [true, 'Course title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Course description is required']
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    materials: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    schedule: [{
        title: String,
        date: Date,
        description: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
courseSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Course', courseSchema); 