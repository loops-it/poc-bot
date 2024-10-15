import { Request, Response } from "express";
import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const listVectorStores = async (): Promise<string[]> => {
  try {
    const vectorStores = await openai.beta.vectorStores.list();
    console.log("vs list: ", vectorStores);
    const fileIds = vectorStores.data.map((file: any) => file.id);
    return fileIds;
  } catch (error) {
    console.error("Error fetching vs list:", error);
    throw new Error("Unable to fetch file list");
  }
};

export const deleteVSByIds = async (vsIds: string[]): Promise<void> => {
  for (const vsId of vsIds) {
    try {
      const deletedVectorStore = await openai.beta.vectorStores.del(
        vsId
      );
      console.log(`Deleted file with ID: ${deletedVectorStore}`);
    } catch (error) {
      console.error(`Error deleting file with ID: ${vsId}`, error);
    }
  }
};

export const deleteAllVectorStores = async (req: Request, res: Response) => {
  let fileIds: string[] = [];

  try {
    fileIds = await listVectorStores();
    console.log("Files to be deleted:", fileIds);

    if (fileIds.length === 0) {
      return res.status(200).json({ message: "No files to delete" });
    }

    await deleteVSByIds(fileIds);

    return res.status(200).json({ message: "All files deleted successfully" });
  } catch (error) {
    console.error("Error deleting files:", error);
    return res.status(500).json({ error: "Error deleting files" });
  }
};
