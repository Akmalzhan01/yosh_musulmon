const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/karavan_ihlas_register')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const userRoutes = require('./routes/userRoutes');

// Routes Placeholder
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Karavan Ihlas Register API running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
