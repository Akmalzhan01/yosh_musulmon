const mongoose = require('mongoose');
const AppSettings = require('../models/AppSettings');

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    return mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://akmalzhantokhtasinov_db_user:1234@cluster0.wuqxzpd.mongodb.net/test?appName=Cluster0');
};

// GET /api/settings — public, used by Register page
exports.getSettings = async (req, res) => {
    try {
        await connectDB();
        const settings = await AppSettings.findOneAndUpdate(
            { key: 'main' },
            { $setOnInsert: { key: 'main', registrationOpen: true } },
            { upsert: true, new: true }
        );
        res.json({ registrationOpen: settings.registrationOpen });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi.' });
    }
};

// PUT /api/settings — superadmin only (checked client-side via token)
exports.updateSettings = async (req, res) => {
    try {
        await connectDB();
        const { registrationOpen } = req.body;
        const settings = await AppSettings.findOneAndUpdate(
            { key: 'main' },
            { $set: { registrationOpen } },
            { upsert: true, new: true }
        );
        res.json({ registrationOpen: settings.registrationOpen });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi.' });
    }
};
