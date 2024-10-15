import { Request, Response } from "express";
import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const handleCleanUp = async (req: Request, res: Response) => {
  const { threadID, assistantID, vectorStoreID } = req.body;

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

    res.status(400).json({ error: "No threadId provided" });
  } catch (error) {
    console.error("Error cleaning up:", error);
    res.status(500).json({ error: "Error cleaning up resources" });
  }
};
