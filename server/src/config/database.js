import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return mongoose.connection;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};

export default connectDB;
