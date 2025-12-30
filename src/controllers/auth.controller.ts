import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// ប្រើប្រាស់ SECRET ពី .env ជាដាច់ខាត
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env file");
}

export const register = async (req: Request, res: Response) => {
  // ឆែកមើល Error ពី Validation Middleware (ប្រសិនបើអ្នកប្រើវា)
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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // ១. ស្វែងរកអ្នកប្រើប្រាស់ ហើយរក្សាទុកក្នុង variable ឈ្មោះ 'user' (អក្សរតូច)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // ២. ប្រសិនបើមិនឃើញ user ទេ
    if (!user) return res.status(401).json({ message: "អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ" });

    // ៣. ផ្ទៀងផ្ទាត់ Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server configuration error" });

    // ៤. បង្កើត JWT Token ដោយប្រើ user._id
    const token = jwt.sign(
      { userId: user._id }, 
      secret, 
      { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any }
    );

    // ៥. បញ្ជូនទិន្នន័យត្រឡប់ទៅ Angular វិញ
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      } 
    });

  } catch (error: any) {
    res.status(500).json({ message: "កំហុសម៉ាស៊ីនបម្រើ" });
  }
};