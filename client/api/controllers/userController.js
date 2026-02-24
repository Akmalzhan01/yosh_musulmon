const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    return mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://akmalzhantokhtasinov:ZVOGUMIY47Zn6OLY@cluster0.va4gnff.mongodb.net/karavan_ihlas_register?appName=Cluster0');
};
exports.registerUser = async (req, res) => {
    try {
        await connectDB();
        console.log('Register request body:', req.body);
        const { firstName, lastName, phone, gender, birthYear, region, participationLanguage } = req.body;

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'Бул телефон номер мурун катталган.' });
        }

        const newUser = new User({
            firstName,
            lastName,
            phone,
            gender,
            birthYear,
            region,
            participationLanguage
        });

        await newUser.save();

        res.status(201).json({ message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', user: newUser });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server xatosi.' });
    }
};

// Get all users (with search and pagination placeholder)
exports.getUsers = async (req, res) => {
    try {
        await connectDB();
        console.log('Get Users Query Params:', req.query);
        const { search, gender, region, birthYear, participationLanguage } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (gender && gender !== 'all') query.gender = gender;
        if (region && region !== 'all') query.region = region;
        if (birthYear && birthYear !== 'all') query.birthYear = birthYear;
        if (participationLanguage && participationLanguage !== 'all') query.participationLanguage = participationLanguage;

        const users = await User.find(query).sort({ registeredAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server xatosi.' });
    }
};

// Toggle arrived status
exports.toggleArrived = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });
        }

        user.arrived = !user.arrived;
        if (user.arrived) {
            user.arrivedAt = new Date();
        } else {
            user.arrivedAt = null;
        }

        await user.save();
        res.json({ message: 'Status o\'zgartirildi', user });
    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({ message: 'Server xatosi.' });
    }
};

// Admin Login (Simple)
exports.adminLogin = async (req, res) => {
    try {
        const { password } = req.body;
        if (password === process.env.ADMIN_PASSWORD) {
            res.json({ success: true, token: 'admin-token-secret' });
        } else {
            res.status(401).json({ success: false, message: 'Noto\'g\'ri parol' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi.' });
    }
}
// Update user
exports.updateUser = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });
        }

        res.json({ message: 'Ma\'lumotlar yangilandi', user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server xatosi.' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        console.log('Delete request for user:', id);
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });
        }

        res.json({ message: 'Foydalanuvchi o\'chirildi', id: user._id });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server xatosi.' });
    }
};
