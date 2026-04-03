const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    return mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://akmalzhantokhtasinov_db_user:1234@cluster0.wuqxzpd.mongodb.net/karavan_ihlas_register?appName=Cluster0');
};
const getNextCompetitionId = async () => {
    const last = await User.findOne({ competitionId: { $exists: true } }).sort({ competitionId: -1 });
    return last ? last.competitionId + 1 : 1100;
};

exports.registerUser = async (req, res) => {
    try {
        await connectDB();
        const { firstName, lastName, phone, gender, birthYear, region, participationLanguage } = req.body;

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'Бул телефон номер мурун катталган.' });
        }

        const competitionId = await getNextCompetitionId();

        const newUser = new User({
            competitionId,
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
        res.status(500).json({ message: 'Server xatosi.', error: error.message, stack: error.stack });
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
        if (password === process.env.SUPERADMIN_PASSWORD) {
            res.json({ success: true, token: 'admin-token-secret', role: 'superadmin' });
        } else if (password === process.env.ADMIN_PASSWORD) {
            res.json({ success: true, token: 'admin-token-secret', role: 'admin' });
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

// Add or update etap score
exports.updateScore = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const { etap, ball } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });

        const existing = user.etapScores.find(s => s.etap === etap);
        if (existing) {
            existing.ball = ball;
        } else {
            user.etapScores.push({ etap, ball });
        }

        await user.save();
        res.json({ message: 'Ball saqlandi', user });
    } catch (error) {
        console.error('Update score error:', error);
        res.status(500).json({ message: 'Server xatosi.' });
    }
};

// Delete etap score
exports.deleteScore = async (req, res) => {
    try {
        await connectDB();
        const { id, etap } = req.params;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });

        user.etapScores = user.etapScores.filter(s => s.etap !== parseInt(etap));
        await user.save();
        res.json({ message: 'Ball o\'chirildi', user });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi.' });
    }
};

// Migrate: assign competitionId to existing users without one
exports.migrateIds = async (req, res) => {
    try {
        await connectDB();
        const users = await User.find({
            $or: [{ competitionId: { $exists: false } }, { competitionId: null }]
        }).sort({ registeredAt: 1 });

        if (users.length === 0) return res.json({ message: 'Barcha userlarda ID bor', updated: 0 });

        const agg = await User.aggregate([{ $group: { _id: null, maxId: { $max: '$competitionId' } } }]);
        let nextId = (agg[0]?.maxId || 1099) + 1;

        let updated = 0;
        for (const user of users) {
            await User.findByIdAndUpdate(user._id, { $set: { competitionId: nextId } });
            nextId++;
            updated++;
        }

        res.json({ message: `${updated} ta userga ID berildi` });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ message: 'Server xatosi.', error: error.message });
    }
};

// Admin create user (bypasses registration toggle)
exports.createUser = async (req, res) => {
    try {
        await connectDB();
        const { firstName, lastName, phone, gender, birthYear, region, participationLanguage } = req.body;

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'Бул телефон номер мурун катталган.' });
        }

        const competitionId = await getNextCompetitionId();

        const newUser = new User({
            competitionId,
            firstName,
            lastName,
            phone,
            gender,
            birthYear,
            region,
            participationLanguage
        });

        await newUser.save();
        res.status(201).json({ message: 'Катышуучу кошулду!', user: newUser });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server xatosi.', error: error.message });
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
