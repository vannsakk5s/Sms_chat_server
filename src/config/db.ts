import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/chatdb');
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ DB Error:', err);
    process.exit(1);
  }
};
export default connectDB;