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
exports.handleQuestionResponse = void 0;
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utility_1 = require("./utility");
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
const isProduction = process.env.NODE_ENV === "production";
const uploadsDir = path_1.default.resolve(isProduction ? "dist/uploads" : "src/uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const handleQuestionResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userQuestion = req.body.question;
    const chatId = req.body.chatId;
    const receivedFile = req.file;
    const uploaded_files = [];
    let uploadedFileOne = "";
    let vectorStore = "";
    try {
        // step 1  ==============================================
        // file upload
        if (receivedFile) {
            console.log("File received:", receivedFile);
            if (receivedFile.mimetype !== "application/pdf") {
                return res.status(400).json({ error: "Uploaded file must be a PDF." });
            }
            const pdfFilePath = path_1.default.join(uploadsDir, receivedFile.filename);
            console.log("PDF file path:", pdfFilePath);
            try {
                const uploadFile = yield (0, utility_1.processPdfFile)(pdfFilePath, vectorStore);
                uploaded_files.push(uploadFile);
                uploadedFileOne = uploadFile.uploadedFileID;
            }
            catch (error) {
                return res.status(500).json({ error: error });
            }
        }
        // =================================================
        //   get file list
        let fileIds = [];
        try {
            fileIds = yield (0, utility_1.listFiles)();
        }
        catch (error) {
            return res.status(500).json({ error: error });
        }
        // delete list of vectors
        // await deleteFilesByIds(fileIds);
        // =================================================
        // Log file IDs
        // for (const fileId of fileIds) {
        //     console.log("File list item:", fileId);
        // }
        // Retrieve a file
        //   try {
        //     const file = await retrieveFile(uploadedFileOne);
        //     console.log("Latest Uploaded file:", file);
        //   } catch (error) {
        //     return res.status(500).json({ error: error });
        //   }
        // step 2 ==============================================
        // create assistant
        let myAssistant;
        try {
            myAssistant = yield (0, utility_1.createFriendlyAssistant)(vectorStore);
        }
        catch (error) {
            return res.status(500).json({ error: error });
        }
        // const threadId = await createEmptyThread();
        // console.log("thead id: ", threadId, "file id: ", uploadedFileOne, "user Question: ",userQuestion )
        const messageResponse = yield (0, utility_1.sendMessageToThread)(userQuestion, vectorStore);
        // run assistant
        const run = yield openai.beta.threads.runs.createAndPoll(messageResponse.threadId, { assistant_id: myAssistant });
        console.log("assistant run : ", run);
        const allMessages = yield openai.beta.threads.messages.list(messageResponse.threadId);
        console.log("thread messages : ", allMessages.data);
        console.log("Thread messages:", JSON.stringify(allMessages.data, null, 2));
        const latestAssistantMessage = (0, utility_1.findLatestAssistantMessage)(allMessages.data);
        if (latestAssistantMessage) {
            const latestMessageContent = ((_b = (_a = latestAssistantMessage.content[0]) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.value) ||
                "No content available";
            res.json({
                message: latestMessageContent,
                threadId: messageResponse.threadId,
                messageResponse: messageResponse,
                latestAssistantMessage: latestMessageContent,
            });
        }
        else {
            res.json({
                message: "No assistant message found.",
                threadId: messageResponse.threadId,
                messageResponse: messageResponse,
                latestAssistantMessage: "No assistant message found.",
            });
        }
    }
    catch (error) {
        console.error("Error with OpenAI API:", error);
        res.status(500).json({ error: "Error processing your request" });
    }
});
exports.handleQuestionResponse = handleQuestionResponse;
