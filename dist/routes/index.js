"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const indexController_1 = require("../controllers/indexController");
// import { questionResponse } from '../controllers/questionResponse';
const multer_1 = __importDefault(require("multer"));
const botController_1 = require("../controllers/botController");
const handleCleanUp_1 = require("../controllers/handleCleanUp");
const deleteAllFiles_1 = require("../controllers/deleteAllFiles");
const deleteAllVectorStores_1 = require("../controllers/deleteAllVectorStores");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
});
router.get('/', indexController_1.home);
router.get('/delete-all-files', deleteAllFiles_1.deleteAllFiles);
router.get('/delete-vector-stores', deleteAllVectorStores_1.deleteAllVectorStores);
router.post('/question-response', upload.single('file'), botController_1.handleQuestionResponse);
router.post('/cleanup-thread', handleCleanUp_1.handleCleanUp);
exports.default = router;
