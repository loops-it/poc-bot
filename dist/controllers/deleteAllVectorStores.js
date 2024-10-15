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
exports.deleteAllVectorStores = exports.deleteVSByIds = exports.listVectorStores = void 0;
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
const listVectorStores = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vectorStores = yield openai.beta.vectorStores.list();
        console.log("vs list: ", vectorStores);
        const fileIds = vectorStores.data.map((file) => file.id);
        return fileIds;
    }
    catch (error) {
        console.error("Error fetching vs list:", error);
        throw new Error("Unable to fetch file list");
    }
});
exports.listVectorStores = listVectorStores;
const deleteVSByIds = (vsIds) => __awaiter(void 0, void 0, void 0, function* () {
    for (const vsId of vsIds) {
        try {
            const deletedVectorStore = yield openai.beta.vectorStores.del(vsId);
            console.log(`Deleted file with ID: ${deletedVectorStore}`);
        }
        catch (error) {
            console.error(`Error deleting file with ID: ${vsId}`, error);
        }
    }
});
exports.deleteVSByIds = deleteVSByIds;
const deleteAllVectorStores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let fileIds = [];
    try {
        fileIds = yield (0, exports.listVectorStores)();
        console.log("Files to be deleted:", fileIds);
        if (fileIds.length === 0) {
            return res.status(200).json({ message: "No files to delete" });
        }
        yield (0, exports.deleteVSByIds)(fileIds);
        return res.status(200).json({ message: "All files deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting files:", error);
        return res.status(500).json({ error: "Error deleting files" });
    }
});
exports.deleteAllVectorStores = deleteAllVectorStores;
