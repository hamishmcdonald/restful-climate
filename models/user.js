const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
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
    accessToken: {
        type: String
    },
    LastLogin : {
        type: Date,
        default: Date.now,
    }
})

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema)