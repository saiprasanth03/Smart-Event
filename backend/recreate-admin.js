require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-event';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');

    // Delete and recreate admin
    await User.deleteOne({ email: 'vishnu@gmail.com' });
    const u = new User({
        name: 'Vishnu Admin',
        email: 'vishnu@gmail.com',
        password: 'password123',
        role: 'Admin'
    });
    await u.save();

    // Verify password compare works
    const ok = await u.comparePassword('password123');
    const fail = await u.comparePassword('wrongpass');

    console.log('Admin created successfully');
    console.log('Correct password matches:', ok);   // must be true
    console.log('Wrong password rejected:', !fail);  // must be true

    mongoose.connection.close();
    process.exit(0);
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
