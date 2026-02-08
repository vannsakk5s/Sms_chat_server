import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatdb';

    await mongoose.connect(dbUri);
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};

export default connectDB;