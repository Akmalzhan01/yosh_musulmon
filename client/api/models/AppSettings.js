const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
    key: { type: String, unique: true, default: 'main' },
    registrationOpen: { type: Boolean, default: true },
});

module.exports = mongoose.model('AppSettings', appSettingsSchema);
