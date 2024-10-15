import { Request, Response } from "express";
import OpenAI from "openai";
import "dotenv/config";
import { deleteFilesByIds, listFiles } from "./utility";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const deleteAllFiles = async (req: Request, res: Response) => {
    let fileIds: string[] = [];

  try {
    fileIds = await listFiles();
    console.log("Files to be deleted:", fileIds);

    if (fileIds.length === 0) {
      return res.status(200).json({ message: "No files to delete" });
    }

    await deleteFilesByIds(fileIds);

    return res.status(200).json({ message: "All files deleted successfully" });
  } catch (error) {
    console.error("Error deleting files:", error);
    return res.status(500).json({ error: "Error deleting files" });
  }
};
