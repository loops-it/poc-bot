import express from 'express';
import { home } from '../controllers/indexController';
import { questionResponse } from '../controllers/questionResponse';
import multer from 'multer';
import { handleQuestionResponse } from '../controllers/botController';


// const upload = multer({ storage: multer.memoryStorage() });
const upload = multer({ dest: 'src/uploads' });
const router = express.Router();

router.get('/', home);
router.post('/question-response', upload.single('file'), handleQuestionResponse);

export default router;
