const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        unique: true
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
   role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
        required: true
    },
    LastLogin : {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('User', userSchema)