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
const tmp_1 = __importDefault(require("tmp"));
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
let vectorStoreID = "";
let uploadedDocuments = [];
let currentThreadID = "";
const handleQuestionResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuestion = req.body.question;
    const receivedFile = req.file;
    let assistantID = "";
    let document;
    try {
        if (receivedFile) {
            console.log("File received:", receivedFile);
            if (receivedFile.mimetype !== "application/pdf") {
                return res.status(400).json({ error: "Uploaded file must be a PDF." });
            }
            // const tempFilePath = path.join(
            //   __dirname,
            //   "uploads",
            //   receivedFile.originalname
            // );
            const tempFile = tmp_1.default.fileSync({ postfix: ".pdf" });
            // await fs.promises.writeFile(tempFilePath, receivedFile.buffer);
            yield fs_1.default.promises.writeFile(tempFile.name, receivedFile.buffer);
            if (tempFile) {
                document = yield openai.files.create({
                    file: fs_1.default.createReadStream(tempFile.name),
                    purpose: "assistants",
                });
                uploadedDocuments.push(document.id);
                if (uploadedDocuments.length > 2) {
                    uploadedDocuments.shift();
                }
                tempFile.removeCallback();
                // await fs.promises.unlink(tempFile);
                console.log("Uploaded documents in if:", uploadedDocuments);
            }
        }
        console.log("Uploaded documents:", uploadedDocuments);
        if (!assistantID) {
            const assistant = yield openai.beta.assistants.create({
                name: "KodeTech Assistant",
                instructions: `
      You are a friendly assistant named 'KodeTech Assistant' here to help answer user questions based on the provided documents. Please be helpful and approachable.

      1. **Document First**: Use the uploaded document related to the current question (e.g., green loans) for your responses.
      2. **Topic Continuity**: Stay focused on the same document until the user explicitly introduces a new topic or mentions another uploaded document. For follow-up questions, frame your answers as "According to the uploaded document on [specific topic], what is the [specific question]?"
      3. **Public Info Backup**: If you can't find the answer in the documents, use public information to assist while remaining helpful.
      4. **Friendly Tone**: Always respond in a friendly, approachable manner, and seek clarification if needed.
      5. **Fallback**: If no relevant information is available from the documents or public information, suggest looking for general information or consulting an expert.
    `,
                model: "gpt-4o-mini",
                tools: [{ type: "file_search" }],
            });
            assistantID = assistant.id;
        }
        else {
            console.log("Reusing existing Assistant:", assistantID);
        }
        if (!vectorStoreID) {
            console.log("Creating new vector store...");
            let vectorStore = yield openai.beta.vectorStores.create({
                name: "Helper Docs",
                expires_after: {
                    anchor: "last_active_at",
                    days: 1,
                },
                chunking_strategy: {
                    type: 'static',
                    static: {
                        max_chunk_size_tokens: 300,
                        chunk_overlap_tokens: 100
                    }
                }
            });
            vectorStoreID = vectorStore.id;
        }
        else {
            console.log("Reusing existing vector store:", vectorStoreID);
        }
        yield openai.beta.assistants.update(assistantID, {
            tool_resources: {
                file_search: {
                    vector_store_ids: [vectorStoreID],
                }
            },
        });
        if (!currentThreadID) {
            const thread = yield openai.beta.threads.create({
                messages: [
                    {
                        role: "user",
                        content: userQuestion,
                        attachments: uploadedDocuments.map((fileId) => ({
                            file_id: fileId,
                            tools: [{ type: "file_search" }],
                        })),
                    },
                ],
            });
            currentThreadID = thread.id;
            console.log("Created new thread:", currentThreadID);
        }
        else {
            console.log("Reusing existing thread:", currentThreadID);
            yield openai.beta.threads.messages.create(currentThreadID, {
                role: "user",
                content: userQuestion,
                attachments: uploadedDocuments.map((fileId) => ({
                    file_id: fileId,
                    tools: [{ type: "file_search" }],
                })),
            });
        }
        const run = yield openai.beta.threads.runs.createAndPoll(currentThreadID, {
            assistant_id: assistantID,
        });
        const messages = yield openai.beta.threads.messages.list(currentThreadID, {
            run_id: run.id,
        });
        const message = messages.data.pop();
        let latestMessageContent = "";
        let citations = [];
        if (message.content[0].type === "text") {
            const { text } = message.content[0];
            const { annotations } = text;
            citations = [];
            let index = 0;
            for (let annotation of annotations) {
                const annotationWithCitation = annotation;
                text.value = text.value.replace(annotation.text, "[" + index + "]");
                const { file_citation } = annotationWithCitation;
                if (file_citation) {
                    const citedFile = yield openai.files.retrieve(file_citation.file_id);
                    citations.push("[" + index + "] " + citedFile.filename);
                }
                index++;
            }
            latestMessageContent = text.value;
        }
        res.json({
            message: latestMessageContent,
            citations: citations.join("\n"),
            threadId: currentThreadID,
        });
    }
    catch (error) {
        console.error("Error with OpenAI API:", error);
        res.status(500).json({ error: "Error processing your request" });
    }
});
exports.handleQuestionResponse = handleQuestionResponse;
