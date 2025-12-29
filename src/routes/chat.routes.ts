import { Router } from 'express';
import { getHistory } from '../controllers/chat.controller';

const router = Router();
router.get('/history/:room', getHistory);

export default router;