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
exports.searchQueryOpenAI = exports.generateContextAndAnswer = exports.generateContext = exports.generateEmbeddings = exports.upsertDocument = exports.processAndUpsertText = exports.generateDocumentId = exports.generateConversationId = exports.generateChatId = void 0;
const openai_1 = __importDefault(require("openai"));
const pinecone_1 = require("@pinecone-database/pinecone");
require("dotenv/config");
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
if (!process.env.PINECONE_API_KEY ||
    typeof process.env.PINECONE_API_KEY !== "string") {
    throw new Error("Pinecone API key is not defined or is not a string.");
}
const pc = new pinecone_1.Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const indexName = process.env.PINECONE_INDEX || "";
const namespaceName = process.env.PINECONE_NAMESPACE || "";
const index = pc.index(indexName);
// Generate chunk ID
const generateChatId = () => {
    const currentDate = new Date();
    const prefix = "Chunk";
    const formattedDate = currentDate.toISOString().replace(/[-:.]/g, "");
    return `${prefix}_${formattedDate}`;
};
exports.generateChatId = generateChatId;
const generateConversationId = () => {
    const currentDate = new Date();
    const prefix = "Chat";
    const formattedDate = currentDate.toISOString().replace(/[-:.]/g, "");
    return `${prefix}_${formattedDate}`;
};
exports.generateConversationId = generateConversationId;
// Generate doc ID
const generateDocumentId = () => {
    const currentDate = new Date();
    const prefix = "Doc";
    const formattedDate = currentDate.toISOString().replace(/[-:.]/g, "");
    return `${prefix}_${formattedDate}`;
};
exports.generateDocumentId = generateDocumentId;
// split into chunks
const splitTextIntoChunks = (text, chunkSize) => {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        let end = Math.min(start + chunkSize, text.length);
        if (end < text.length && text[end] !== " " && text[end] !== "\n") {
            end = text.lastIndexOf(" ", end) || end;
        }
        chunks.push(text.slice(start, end).trim());
        start = end;
    }
    return chunks;
};
// embedd and upsert
const processAndUpsertText = (text_1, title_1, category_1, ...args_1) => __awaiter(void 0, [text_1, title_1, category_1, ...args_1], void 0, function* (text, title, category, chunkSize = 1536) {
    console.log("title: ", title);
    console.log("category: ", category);
    console.log("text: ", text);
    // const chunks = splitTextIntoChunks(text, chunkSize);
    const docId = (0, exports.generateDocumentId)();
    // for (const chunk of chunks) {
    try {
        const response = yield openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: text,
        });
        const uniqueId = (0, exports.generateChatId)();
        const embeddings = response.data[0].embedding;
        console.log("embeddings: ", embeddings);
        // Upsert the chunk into Pinecone
        yield index.namespace(namespaceName).upsert([
            {
                id: uniqueId,
                values: embeddings,
                metadata: {
                    docId: docId,
                    title: title,
                    category: category.toLowerCase().trim(),
                    text: text,
                },
            },
        ]);
        console.log(`Chunk with ID ${uniqueId} upserted successfully.`);
    }
    catch (error) {
        console.error("Error processing chunk:", error);
        throw new Error(`Failed to process chunk: ${error}`);
    }
    // }
});
exports.processAndUpsertText = processAndUpsertText;
// pinecone data upsert
const upsertDocument = (id, values, metadata) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pineconeNamespace = index.namespace(namespaceName);
        yield pineconeNamespace.upsert([
            {
                id: id,
                values: values,
                metadata: metadata,
            },
        ]);
        console.log(`Document with ID ${id} upserted successfully.`);
    }
    catch (error) {
        console.error("Error upserting document:", error);
        throw new Error(`Failed to upsert document: ${error}`);
    }
});
exports.upsertDocument = upsertDocument;
// open ai embeddings
const generateEmbeddings = (text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: text,
        });
        return response.data[0].embedding;
    }
    catch (error) {
        console.error("Error generating embeddings:", error);
        throw new Error(`Failed to generate embeddings: ${error}`);
    }
});
exports.generateEmbeddings = generateEmbeddings;
// generate context
const generateContext = (completionQuestion) => __awaiter(void 0, void 0, void 0, function* () {
    const embedding = yield openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: completionQuestion,
    });
    const namespace = index.namespace(namespaceName);
    const queryResponse = yield namespace.query({
        vector: embedding.data[0].embedding,
        topK: 5,
        includeMetadata: true,
    });
    const titlesMap = new Map();
    queryResponse.matches.forEach((match) => {
        const metadata = match.metadata;
        if (metadata.title && metadata.docId) {
            titlesMap.set(metadata.title, metadata.docId);
        }
    });
    const titlesArrayWithCategory = queryResponse.matches
        .map((match) => {
        var _a;
        const metadata = match.metadata;
        return `${(_a = metadata.category) !== null && _a !== void 0 ? _a : "N/A"} \n`;
    })
        .join("\n");
    console.log("Categories : ", titlesArrayWithCategory);
    const titlesArray = Array.from(titlesMap.entries()).map(([title, docId], index) => ({
        id: `title-${index}`,
        title: title,
        docId: docId
    }));
    return { titles: titlesArray };
});
exports.generateContext = generateContext;
const generateContextAndAnswer = (userQuestion) => __awaiter(void 0, void 0, void 0, function* () {
    const embedding = yield openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: userQuestion,
    });
    const namespace = index.namespace(namespaceName);
    const queryResponse = yield namespace.query({
        vector: embedding.data[0].embedding,
        topK: 3,
        includeMetadata: true,
    });
    const titlesArray = queryResponse.matches
        .map((match) => {
        var _a;
        const metadata = match.metadata;
        return `${(_a = metadata.text) !== null && _a !== void 0 ? _a : "N/A"} \n`;
    })
        .join("\n");
    const titlesArrayFiltered = queryResponse.matches
        .map((match) => {
        var _a;
        const metadata = match.metadata;
        return `${(_a = metadata.category) !== null && _a !== void 0 ? _a : "N/A"} \n`;
    })
        .join("\n");
    console.log("category array : ", titlesArrayFiltered);
    return titlesArray;
});
exports.generateContextAndAnswer = generateContextAndAnswer;
// open ai search
const searchQueryOpenAI = (question, titles) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const context = `
    ${titles}`;
        const generateAnswerPrompt = `
      Based on the provided context, answer the following question as accurately as possible. Do not include information that is not present in the context.
      ----------
      CONTEXT:
      ${context}
      ----------
      QUESTION:
      ${question}
      ----------
      Answer:
    `;
        const completionQuestion = yield openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: generateAnswerPrompt,
            max_tokens: 150,
            temperature: 0,
        });
        // console.log(
        //   "Answer : ",
        //   completionQuestion.choices[0].text.trim()
        // );
        let results = completionQuestion.choices[0].text.trim();
        return results;
    }
    catch (error) {
        console.error("Error generating embeddings:", error);
        throw new Error(`Failed to generate embeddings: ${error}`);
    }
});
exports.searchQueryOpenAI = searchQueryOpenAI;
