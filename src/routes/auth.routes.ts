// import { Router } from 'express';
// import { register, login } from '../controllers/auth.controller';
// import { body } from 'express-validator';

// const router = Router();
// router.post('/register', [
//   body('email').isEmail().withMessage('អ៊ីមែលមិនត្រឹមត្រូវ'),
//   body('password').isLength({ min: 6 }).withMessage('លេខសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ ខ្ទង់'),
//   body('username').notEmpty().withMessage('ឈ្មោះមិនអាចទទេបានទេ')
// ], register);

// router.post('/login', [
//   body('email').isEmail().withMessage('អ៊ីមែលមិនត្រឹមត្រូវ'),
//   body('password').notEmpty().withMessage('សូមបញ្ចូលលេខសម្ងាត់')
// ], login);

// export default router;

import { Router } from 'express';
import { register, login, telegramLogin } from '../controllers/auth.controller'; // ១. បន្ថែមការ import telegramLogin
import { body } from 'express-validator';

const router = Router();

// Register ធម្មតា
router.post('/register', [
  body('email').isEmail().withMessage('អ៊ីមែលមិនត្រឹមត្រូវ'),
  body('password').isLength({ min: 6 }).withMessage('លេខសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ ខ្ទង់'),
  body('username').notEmpty().withMessage('ឈ្មោះមិនអាចទទេបានទេ')
], register);

// Login ធម្មតា
router.post('/login', [
  body('email').isEmail().withMessage('អ៊ីមែលមិនត្រឹមត្រូវ'),
  body('password').notEmpty().withMessage('សូមបញ្ចូលលេខសម្ងាត់')
], login);

// ២. បន្ថែម Route សម្រាប់ Telegram Login
// ចំណុចនេះយើងមិនប្រើ Validation Middleware ដូចខាងលើទេ 
// ព្រោះការផ្ទៀងផ្ទាត់ត្រូវបានធ្វើឡើងតាមរយៈ Hash នៅក្នុង Controller រួចរាល់ហើយ
router.post('/telegram-login', telegramLogin);

export default router;