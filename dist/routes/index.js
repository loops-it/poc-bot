"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const indexController_1 = require("../controllers/indexController");
const multer_1 = __importDefault(require("multer"));
const botController_1 = require("../controllers/botController");
// const upload = multer({ storage: multer.memoryStorage() });
const upload = (0, multer_1.default)({ dest: 'src/uploads' });
const router = express_1.default.Router();
router.get('/', indexController_1.home);
router.post('/question-response', upload.single('file'), botController_1.handleQuestionResponse);
exports.default = router;
