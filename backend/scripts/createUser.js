import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const createUser = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const hashedPassword = await bcrypt.hash('1234567', 10);
    const user = new User({ email: 'nithin', password: hashedPassword });
    await user.save();
    console.log('User created: nithin');
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err);
    process.exit(1);
  }
};

createUser();
