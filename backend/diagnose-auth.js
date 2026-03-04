const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Participant'], default: 'Participant' },
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('UserDiagnostic', userSchema);

const URI = 'mongodb+srv://saisakfrnd_db_user:trfE0kdCjWL8SiQZ@cluster0.jqroton.mongodb.net/?appName=Cluster0';

async function diagnose() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(URI);
        console.log('Connected.');

        const email = 'vishnu@gmail.com';
        const password = 'password123';

        console.log(`Checking for user: ${email}`);
        let user = await User.findOne({ email });

        if (user) {
            console.log('User found. Deleting to reset...');
            await User.deleteOne({ email });
        }

        console.log('Creating user with password123...');
        user = new User({
            name: 'Vishnu',
            email: email,
            password: password,
            role: 'Admin'
        });

        await user.save();
        console.log('User saved.');

        console.log('Retreiving user...');
        const fetchedUser = await User.findOne({ email });
        console.log('Password hash in DB:', fetchedUser.password);

        console.log('Testing comparison...');
        const isMatch = await fetchedUser.comparePassword(password);
        console.log('Does password123 match?', isMatch);

        const isMatchWrong = await fetchedUser.comparePassword('wrongpassword');
        console.log('Does wrongpassword match?', isMatchWrong);

        process.exit(0);
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnose();
