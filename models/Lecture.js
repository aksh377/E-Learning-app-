const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Lecture title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Lecture content is required']
    },
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required']
    },
    duration: {
        type: Number,  // in minutes
        required: [true, 'Duration is required']
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    completions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
lectureSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Lecture', lectureSchema); 