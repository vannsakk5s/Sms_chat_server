// import mongoose, { Schema } from 'mongoose';

// const UserSchema = new Schema({
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// }, { timestamps: true });

// export default mongoose.model('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';

// បង្កើត Interface សម្រាប់ TypeScript (Optional but recommended)
export interface IUser extends Document {
  username: string;
  email?: string;
  password?: string;
  telegramId?: string; // ID ពី Telegram
  firstName?: string;
  photoUrl?: string;
}

const UserSchema = new Schema({
  username: { type: String, required: true },
  
  // ទុកវាជា Optional ព្រោះ Telegram អត់មាន Email ទេ
  email: { 
    type: String, 
    unique: true, 
    sparse: true, // sparse អនុញ្ញាតឱ្យមានតម្លៃ null ច្រើន (បើមិនដាក់ទេ វានឹង error unique)
    required: false 
  },
  
  // ទុកជា Optional ព្រោះ Telegram Login ប្រើ Hash មិនមែន Password ទេ
  password: { type: String, required: false },

  // បន្ថែម Field សម្រាប់ Telegram
  telegramId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  
  firstName: { type: String },
  photoUrl: { type: String },
  
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);