const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    competitionId: {
        type: Number,
        unique: true,
        sparse: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ['Эркек', 'Аял', 'Уул', 'Кыз'],
        required: true
    },
    birthYear: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    participationLanguage: {
        type: String,
        enum: ['Өзбек тили', 'Кыргыз тили'],
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    arrived: {
        type: Boolean,
        default: false
    },
    arrivedAt: {
        type: Date
    },
    etapScores: [{
        etap: { type: Number, required: true },
        ball: { type: Number, required: true }
    }]
});

module.exports = mongoose.model('User', userSchema);
