import mongoose from 'mongoose';
import dotenv from 'dotenv';

// ហៅ dotenv ដើម្បីអាចអាន process.env បាន
dotenv.config();

const connectDB = async () => {
  try {
    // ប្រើតម្លៃពី .env បើគ្មានទេ វានឹងប្រើ local ជា fallback
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatdb';

    await mongoose.connect(dbUri);
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    // បញ្ឈប់ដំណើរការ Server បើមិនអាចភ្ជាប់ Database បាន
    process.exit(1);
  }
};

export default connectDB;