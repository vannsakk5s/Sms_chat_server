import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string;
  password?: string;
  telegramId?: string;
  firstName?: string;
  photoUrl?: string;
}

const UserSchema = new Schema({
  username: { type: String, required: true },

  email: { 
    type: String, 
    unique: true, 
    sparse: true,
    required: false 
  },
  
  password: { type: String, required: false },

  telegramId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  
  firstName: { type: String },
  photoUrl: { type: String },
  
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);