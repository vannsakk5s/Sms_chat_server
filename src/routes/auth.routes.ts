import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { body } from 'express-validator';

const router = Router();
router.post('/register', [
  body('email').isEmail().withMessage('អ៊ីមែលមិនត្រឹមត្រូវ'),
  body('password').isLength({ min: 6 }).withMessage('លេខសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ ខ្ទង់'),
  body('username').notEmpty().withMessage('ឈ្មោះមិនអាចទទេបានទេ')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('អ៊ីមែលមិនត្រឹមត្រូវ'),
  body('password').notEmpty().withMessage('សូមបញ្ចូលលេខសម្ងាត់')
], login);

export default router;