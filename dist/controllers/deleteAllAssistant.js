"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
// export const listAssistant = async (): Promise<string[]> => {
//   try {
//     const myAssistants = await openai.beta.assistants.list({
//       order: "desc",
//       limit: "20",
//     });
//     console.log(myAssistants.data);
//     const fileIds = myAssistants.data.map((file: any) => file.id);
//     return fileIds;
//   } catch (error) {
//     console.error("Error fetching vs list:", error);
//     throw new Error("Unable to fetch file list");
//   }
// };
// export const deleteAssistantByIds = async (vsIds: string[]): Promise<void> => {
//   for (const vsId of vsIds) {
//     try {
//       const deletedVectorStore = await openai.beta.vectorStores.del(
//         vsId
//       );
//       const response = await openai.beta.assistants.del("asst_abc123");
//       console.log(`Deleted file with ID: ${deletedVectorStore}`);
//     } catch (error) {
//       console.error(`Error deleting file with ID: ${vsId}`, error);
//     }
//   }
// };
// export const deleteAllVectorStores = async (req: Request, res: Response) => {
//   let fileIds: string[] = [];
//   try {
//     fileIds = await listAssistant();
//     console.log("Files to be deleted:", fileIds);
//     if (fileIds.length === 0) {
//       return res.status(200).json({ message: "No files to delete" });
//     }
//     await deleteAssistantByIds(fileIds);
//     return res.status(200).json({ message: "All files deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting files:", error);
//     return res.status(500).json({ error: "Error deleting files" });
//   }
// };
