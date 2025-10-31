import mongoose from 'mongoose';
import {ENV} from './env.js';

const mongoURI = ENV.MONGODB_URI;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  } 
};  