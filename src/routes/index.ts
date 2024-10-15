import express from 'express';
import { home } from '../controllers/indexController';
// import { questionResponse } from '../controllers/questionResponse';
import multer from 'multer';
import { handleQuestionResponse } from '../controllers/botController';
import { handleCleanUp } from '../controllers/handleCleanUp';
import { deleteAllFiles } from '../controllers/deleteAllFiles';
import { deleteAllVectorStores } from '../controllers/deleteAllVectorStores';

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
  });

router.get('/', home);
router.get('/delete-all-files', deleteAllFiles);
router.get('/delete-vector-stores', deleteAllVectorStores);
router.post('/question-response', upload.single('file'), handleQuestionResponse);
router.post('/cleanup-thread', handleCleanUp);

export default router;
