// import { Request, Response } from "express";
// import OpenAI from "openai";
// import "dotenv/config";
// import fs from "fs";
// import path from "path";
// import {
//   createEmptyThread,
//   createFriendlyAssistant,
//   deleteFilesByIds,
//   findLatestAssistantMessage,
//   listFiles,
//   processPdfFile,
//   retrieveFile,
//   sendMessageToThread,
// } from "./utility";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const isProduction = process.env.NODE_ENV === "production";
// const uploadsDir = path.resolve(isProduction ? "dist/uploads" : "src/uploads");

// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// export const handleQuestionResponse = async (req: Request, res: Response) => {
//   const userQuestion = req.body.question;
//   const chatId = req.body.chatId;
//   const receivedFile = req.file;
//   const uploaded_files = [];
//   let uploadedFileOne = "";
//   let vectorStore = "";

//   try {
//     // step 1  ==============================================
//     // file upload
//     if (receivedFile) {
//       console.log("File received:", receivedFile);

//       if (receivedFile.mimetype !== "application/pdf") {
//         return res.status(400).json({ error: "Uploaded file must be a PDF." });
//       }

//       const pdfFilePath = path.join(uploadsDir, receivedFile.filename);
//       console.log("PDF file path:", pdfFilePath);

//       try {
//         const uploadFile = await processPdfFile(pdfFilePath, vectorStore);
//         uploaded_files.push(uploadFile);
//         uploadedFileOne = uploadFile.uploadedFileID;
//       } catch (error) {
//         return res.status(500).json({ error: error });
//       }
//     }




//     // =================================================
//     //   get file list
//     let fileIds: string[] = [];
//     try {
//       fileIds = await listFiles();
//     } catch (error) {
//       return res.status(500).json({ error: error });
//     }
//     // delete list of vectors
//     // await deleteFilesByIds(fileIds);
//     // =================================================




//     // Log file IDs
//     // for (const fileId of fileIds) {
//     //     console.log("File list item:", fileId);
//     // }

//     // Retrieve a file
//     //   try {
//     //     const file = await retrieveFile(uploadedFileOne);
//     //     console.log("Latest Uploaded file:", file);
//     //   } catch (error) {
//     //     return res.status(500).json({ error: error });
//     //   }

//     // step 2 ==============================================
//     // create assistant
//     let myAssistant;
//     try {
//       myAssistant = await createFriendlyAssistant(vectorStore);
//     } catch (error) {
//       return res.status(500).json({ error: error });
//     }

//     // const threadId = await createEmptyThread();
//     // console.log("thead id: ", threadId, "file id: ", uploadedFileOne, "user Question: ",userQuestion )
//     const messageResponse = await sendMessageToThread(
//       userQuestion,
//       vectorStore,
//     );

//     // run assistant
//     const run = await openai.beta.threads.runs.createAndPoll(
//       messageResponse.threadId,
//       { assistant_id: myAssistant }
//     );

//     console.log("assistant run : ", run);

//     const allMessages = await openai.beta.threads.messages.list(
//       messageResponse.threadId
//     );

//     console.log("thread messages : ", allMessages.data);
//     console.log("Thread messages:", JSON.stringify(allMessages.data, null, 2));
//     const latestAssistantMessage = findLatestAssistantMessage(allMessages.data);

//     if (latestAssistantMessage) {
//       const latestMessageContent =
//         latestAssistantMessage.content[0]?.text?.value ||
//         "No content available";

//       res.json({
//         message: latestMessageContent,
//         threadId: messageResponse.threadId,
//         messageResponse: messageResponse,
//         latestAssistantMessage: latestMessageContent,
//       });
//     } else {
//       res.json({
//         message: "No assistant message found.",
//         threadId: messageResponse.threadId,
//         messageResponse: messageResponse,
//         latestAssistantMessage: "No assistant message found.",
//       });
//     }
//   } catch (error) {
//     console.error("Error with OpenAI API:", error);
//     res.status(500).json({ error: "Error processing your request" });
//   }
// };
