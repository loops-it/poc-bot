import { Request, Response } from "express";
import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const handleCleanUp = async (req: Request, res: Response) => {
  const { threadID, assistantID, vectorStoreID, uploadedDocuments } = req.body;

  console.log("Received cleanup request:", { threadID, assistantID, vectorStoreID, uploadedDocuments });
  try {
    if (threadID) {
      const response = await openai.beta.threads.del(threadID);
      console.log("delete thread: ",response);
    }

    if (assistantID) {
      const response = await openai.beta.assistants.del(assistantID);
      console.log("delete assistant: ", response);
    }

    if (vectorStoreID) {
      const deletedVectorStore = await openai.beta.vectorStores.del(
        vectorStoreID
      );
      console.log("delete vector store: ", deletedVectorStore);
    }

    if (uploadedDocuments && uploadedDocuments.length > 0) {
      for (const documentId of uploadedDocuments) {
        const fileResponse = await openai.files.del(documentId);
        console.log(`Deleted document ${documentId}: `, fileResponse);
      }
    }

    res.status(200).json({ error: "Cleanup successful" });
  } catch (error) {
    console.error("Error cleaning up:", error);
    res.status(500).json({ error: "Error cleaning up resources" });
  }
};
