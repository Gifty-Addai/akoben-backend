import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';

dotenv.config();

const createAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const adminEmail = 'hacphran122@gmail.com';
        const adminPhone = '0247413964';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('luckyceci789', salt);

        const adminUser = new User({
            name: 'Super Admin',
            email: adminEmail,
            phone: adminPhone,
            password: hashedPassword,
            role: 'admin',
            isEmailConfirmed: true,
            active: true
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: luckyceci789`);

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
