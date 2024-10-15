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
exports.findLatestAssistantMessage = exports.retrieveFile = exports.listFiles = exports.deleteFilesByIds = exports.getOrCreateVectorStore = void 0;
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
// const isProduction = process.env.NODE_ENV === "production";
// const uploadsDir = path.resolve(isProduction ? "dist/uploads" : "src/uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
let vectorStoreId = null;
// Function to create or retrieve the existing vector store
const getOrCreateVectorStore = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!vectorStoreId) {
        const initialFileIds = yield (0, exports.listFiles)();
        const vectorStore = yield openai.beta.vectorStores.create({
            name: "Helper docs",
            file_ids: initialFileIds,
        });
        vectorStoreId = vectorStore.id;
        console.log("Created new vector store:", vectorStore);
    }
    else {
        console.log("Using existing vector store:", vectorStoreId);
    }
    return vectorStoreId;
});
exports.getOrCreateVectorStore = getOrCreateVectorStore;
//   const addFileToVectorStore = async (fileId: string, vectorStore: string | null): Promise<void> => {
//     // const vectorStoreId = await getOrCreateVectorStore();
//     if (!vectorStore) {
//         console.log("No Vector Store provided, creating or fetching one...");
//         vectorStore = await getOrCreateVectorStore();
//       }
//     const myVectorStoreFile = await openai.beta.vectorStores.files.create(vectorStore, {
//       file_id: fileId,
//     });
//     console.log("Added file to vector store:", myVectorStoreFile);
//     // const vectorStoreFiles = await openai.beta.vectorStores.files.list(vectorStoreId);
//   };
// export const processPdfFile = async (filePath: string, vectorStore: string | null) => {
//   try {
//     const pdfData = await fs.promises.readFile(filePath);
//     const pdfText = await pdf(pdfData);
//     const jsonlFilePath = filePath.replace(/\.pdf$/, ".jsonl");
//     const jsonlContent = `${JSON.stringify({ text: pdfText.text })}\n`;
//     await fs.promises.writeFile(jsonlFilePath, jsonlContent);
//     const jsonlStream = fs.createReadStream(jsonlFilePath);
//     const openaiFile = await openai.files.create({
//       file: jsonlStream,
//       purpose: "assistants",
//     });
//     console.log("Uploaded to OpenAI:", openaiFile);
//   const myVectorStoreFile = await openai.beta.vectorStores.files.create("vs_35Xg5aRa2C22EQYXnnaMRu2w", {
//     file_id: openaiFile.id,
//   });
//   console.log("Added file to vector store:", myVectorStoreFile);
//   const vectorStoreFiles = await openai.beta.vectorStores.files.list(
//     "vs_35Xg5aRa2C22EQYXnnaMRu2w"
//   );
//   console.log("vector store file list: ",vectorStoreFiles);
//     return { uploadedFileID: openaiFile.id};
//   } catch (error) {
//     console.error("Error processing PDF:", error);
//     throw new Error("Error processing the PDF file.");
//   }
// };
// delete given file IDs
const deleteFilesByIds = (fileIds) => __awaiter(void 0, void 0, void 0, function* () {
    for (const fileId of fileIds) {
        try {
            const deleteFileResponse = yield openai.files.del(fileId);
            console.log(`Successfully deleted file with ID: ${fileId}`, deleteFileResponse);
        }
        catch (error) {
            console.error(`Error deleting file with ID ${fileId}:`, error);
        }
    }
});
exports.deleteFilesByIds = deleteFilesByIds;
// retrive list of file IDs
const listFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listResponse = yield openai.files.list();
        const fileIds = listResponse.data.map((file) => file.id);
        console.log("List of file IDs:", fileIds);
        return fileIds;
    }
    catch (error) {
        console.error("Error listing files:", error);
        throw new Error("Failed to list files.");
    }
});
exports.listFiles = listFiles;
// retrive one file
const retrieveFile = (fileId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = yield openai.files.retrieve(fileId);
        // console.log("Retrieved file:", file);
        return file.id;
    }
    catch (error) {
        console.error(`Error retrieving file with ID ${fileId}:`, error);
        throw new Error("Failed to retrieve file.");
    }
});
exports.retrieveFile = retrieveFile;
// create assistant
// export const createFriendlyAssistant = async (vectorStore: string | null) => {
//     try {
//         if (!vectorStore) {
//             console.log("No Vector Store provided, creating or fetching one...");
//             vectorStore = await getOrCreateVectorStore();
//         }
//         const myAssistant = await openai.beta.assistants.create({
//             instructions: "You are a friendly assistant named 'KodeTech Assistant' here to help answer user questions based on the provided documents. Please be helpful and approachable. Do not give answers based on public documents, if you cannot find the answer just say 'sorry.. context not provided.'",
//             name: "KodeTech Assistant",
//             tools: [{ type: "file_search" }],
//             model: "gpt-4o-mini",
//         });
//         console.log("Assistant created successfully:", myAssistant);
//         return myAssistant.id;
//     } catch (error) {
//         console.error("Error creating assistant:", error);
//         throw new Error("Failed to create Assistant.");
//     }
// };
// step 3
// create a empty thread
let threadId = null;
// export const createEmptyThread = async (vectorStore: string | null): Promise<string> => {
//     if (threadId) {
//         console.log("Using existing thread:", threadId);
//         return threadId;
//     }
//     if (!vectorStore) {
//         console.log("No Vector Store provided, creating or fetching one...");
//         vectorStore = await getOrCreateVectorStore();
//     }
//     try {
//         const emptyThread = await openai.beta.threads.create({
//             tool_resources: {
//                 file_search: {
//                     vector_store_ids: [vectorStore],
//                 },
//             },
//         });
//         threadId = emptyThread.id;
//         console.log("Created new thread:", threadId);
//         return threadId;
//     } catch (error) {
//         console.error("Error creating thread:", error);
//         throw new Error("Failed to create thread.");
//     }
// };
// add message to the thread
// export const sendMessageToThread = async (
//     messageContent: string,
//     vectorStore: string | null,
// ) => {
//     try {
//         const currentThreadId = await createEmptyThread(vectorStore);
//         const myMessage = await openai.beta.threads.messages.create(
//             currentThreadId,
//             {
//                 role: "user",
//                 content: messageContent,
//             }
//         );
//         console.log("Message sent to thread:", myMessage);
//         return { message_Id: myMessage.id, threadId: currentThreadId };
//     } catch (error) {
//         console.error("Error sending message to thread:", error);
//         throw new Error("Failed to send message to the thread.");
//     }
// };
// export const updateVectorStoreWithNewFiles = async () => {
//     try {
//         const newFileIds = await listFiles();
//         if (vectorStoreId) {
//             await openai.beta.vectorStores.update(vectorStoreId, {
//                 file_ids: newFileIds,
//             });
//             console.log("Updated vector store with new file IDs:", newFileIds);
//         }
//     } catch (error) {
//         console.error("Error updating vector store with new files:", error);
//         throw new Error("Failed to update vector store.");
//     }
// };
const findLatestAssistantMessage = (messages) => {
    let latestMessage = null;
    for (const message of messages) {
        if (message.role === "assistant") {
            if (!latestMessage || message.created_at > latestMessage.created_at) {
                latestMessage = message;
            }
        }
    }
    return latestMessage;
};
exports.findLatestAssistantMessage = findLatestAssistantMessage;
// const vectorStore = await openai.beta.vectorStores.retrieve(
//     "vs_abc123"
//   );
//   console.log(vectorStore);
// await fs.promises.unlink(filePath).catch(err => {
//     console.error(`Error deleting PDF file: ${err.message}`);
// });
// await fs.promises.unlink(jsonlFilePath).catch(err => {
//     console.error(`Error deleting JSONL file: ${err.message}`);
// });
