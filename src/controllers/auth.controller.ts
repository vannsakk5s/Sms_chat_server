// import { Request, Response } from 'express';
// import User from '../models/User';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { validationResult } from 'express-validator';

// // ប្រើប្រាស់ SECRET ពី .env ជាដាច់ខាត
// const JWT_SECRET = process.env.JWT_SECRET;
// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET is not defined in .env file");
// }

// export const register = async (req: Request, res: Response) => {
//   // ឆែកមើល Error ពី Validation Middleware (ប្រសិនបើអ្នកប្រើវា)
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { username, email, password } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: "អ៊ីមែលនេះមានរួចហើយ" });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new User({
//       username: username.trim(),
//       email: email.toLowerCase().trim(),
//       password: hashedPassword
//     });

//     await newUser.save();
//     res.status(201).json({ message: "ចុះឈ្មោះជោគជ័យ" });
//   } catch (error: any) {
//     console.error("Register Error:", error);
//     res.status(500).json({ message: "កំហុសម៉ាស៊ីនបម្រើ" });
//   }
// };

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // ១. ស្វែងរកអ្នកប្រើប្រាស់ ហើយរក្សាទុកក្នុង variable ឈ្មោះ 'user' (អក្សរតូច)
//     const user = await User.findOne({ email: email.toLowerCase().trim() });
    
//     // ២. ប្រសិនបើមិនឃើញ user ទេ
//     if (!user) return res.status(401).json({ message: "អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ" });

//     // ៣. ផ្ទៀងផ្ទាត់ Password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ" });

//     const secret = process.env.JWT_SECRET;
//     if (!secret) return res.status(500).json({ message: "Server configuration error" });

//     // ៤. បង្កើត JWT Token ដោយប្រើ user._id
//     const token = jwt.sign(
//       { userId: user._id }, 
//       secret, 
//       { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any }
//     );

//     // ៥. បញ្ជូនទិន្នន័យត្រឡប់ទៅ Angular វិញ
//     res.status(200).json({ 
//       token, 
//       user: { 
//         id: user._id, 
//         username: user.username, 
//         email: user.email 
//       } 
//     });

//   } catch (error: any) {
//     res.status(500).json({ message: "កំហុសម៉ាស៊ីនបម្រើ" });
//   }
// };

import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import crypto from 'crypto'; // បន្ថែមនេះសម្រាប់ Telegram

// ប្រើប្រាស់ SECRET ពី .env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env file");
}

// --- ១. Register ធម្មតា (ទុកដដែល) ---
export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "អ៊ីមែលនេះមានរួចហើយ" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "ចុះឈ្មោះជោគជ័យ" });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "កំហុសម៉ាស៊ីនបម្រើ" });
  }
};

// --- ២. Login ធម្មតា (ទុកដដែល) ---
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) return res.status(401).json({ message: "អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ" });

    // ឆែកមើលថាបើ user ចុះឈ្មោះតាម Telegram ហើយអត់មាន password
    if (!user.password) {
        return res.status(401).json({ message: "គណនីនេះត្រូវបានបង្កើតតាមរយៈ Telegram សូមចូលតាម Telegram" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ" });

    const token = jwt.sign(
      { userId: user._id }, 
      JWT_SECRET!, 
      { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any }
    );

    res.status(200).json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email } 
    });
  } catch (error: any) {
    res.status(500).json({ message: "កំហុសម៉ាស៊ីនបម្រើ" });
  }
};

// --- ៣. Telegram Login (បន្ថែមថ្មី) ---
export const telegramLogin = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';

    // ផ្ទៀងផ្ទាត់ Hash ពី Telegram
    const { hash, ...dataWithoutHash } = userData;
    const dataCheckString = Object.keys(dataWithoutHash)
      .sort()
      .map(key => `${key}=${dataWithoutHash[key]}`)
      .join('\n');

    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const hmac = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hmac !== hash) {
      return res.status(401).json({ message: "ការផ្ទៀងផ្ទាត់ Telegram បរាជ័យ" });
    }

    // រក្សាទុក ឬ Update User ទៅក្នុង Database
    // យើងប្រើ findOneAndUpdate ដើម្បីឱ្យវា Register ផង Login ផងក្នុងពេលតែមួយ
    const user = await User.findOneAndUpdate(
      { telegramId: userData.id.toString() },
      {
        username: userData.username || userData.first_name,
        firstName: userData.first_name,
        photoUrl: userData.photo_url
      },
      { upsert: true, new: true }
    );

    // បង្កើត JWT Token (ប្រើ userId ឱ្យដូច Login ធម្មតា ដើម្បីឱ្យ Angular ងាយស្រួលប្រើ)
    const token = jwt.sign(
      { userId: user._id }, 
      JWT_SECRET!, 
      { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        photoUrl: user.photoUrl
      }
    });

  } catch (error) {
    console.error("Telegram Login Error:", error);
    res.status(500).json({ message: "កំហុសម៉ាស៊ីនបម្រើ" });
  }
};