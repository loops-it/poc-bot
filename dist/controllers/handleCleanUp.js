"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCleanUp = void 0;
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
const handleCleanUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { threadID, assistantID, vectorStoreID } = req.body;
    try {
        if (threadID) {
            const response = yield openai.beta.threads.del(threadID);
            console.log("delete thread: ", response);
        }
        if (assistantID) {
            const response = yield openai.beta.assistants.del(assistantID);
            console.log("delete assistant: ", response);
        }
        if (vectorStoreID) {
            const deletedVectorStore = yield openai.beta.vectorStores.del(vectorStoreID);
            console.log("delete vector store: ", deletedVectorStore);
        }
        res.status(400).json({ error: "No threadId provided" });
    }
    catch (error) {
        console.error("Error cleaning up:", error);
        res.status(500).json({ error: "Error cleaning up resources" });
    }
});
exports.handleCleanUp = handleCleanUp;
