"use strict";
// import { Request, Response } from "express";
// import "dotenv/config";
// interface ChatDetails {
//   chatId: string;
// }
// const chatDetailsMemory: { [chatId: string]: ChatDetails } = {};
// const saveChatDetails = (chatId: string): void => {
//   chatDetailsMemory[chatId] = { chatId };
// };
// const getChatDetails = (chatId: string): ChatDetails | undefined => {
//   return chatDetailsMemory[chatId];
// };
// // const clearChatDetails = (chatId: string): void => {
// //   delete chatDetailsMemory[chatId];
// //   console.log(`Memory cleared for chatId ${chatId}`);
// // };
// export const questionResponse = [
//   async (req: Request, res: Response) => {
//     const { userQuestion, chatId } = req.body;
//     if (!userQuestion) {
//       console.error("Error: searchText is undefined");
//       return res
//         .status(400)
//         .json({ message: "'userQuestion' is a required property" });
//     }
//     console.log("user question : ", userQuestion);
//     try {
//       // const chatId = generateConversationId();
//       // console.log("chat ID : ", chatId);
//       let openaiResponse = 'HI';
//       saveChatDetails(chatId);
//       const chatDetails = getChatDetails(chatId);
//       // if (chatDetails) {
//       //   console.log(`Chat ID: ${chatDetails.chatId}`);
//       //   const titles = await generateContextAndAnswer(
//       //     userQuestion        );
//       //   //   console.log("response : ", titles);
//       //   openaiResponse = await searchQueryOpenAI(
//       //     titles,
//       //     userQuestion
//       //           );
//       //   console.log("Openai Response : ", openaiResponse);
//       // }
//       // Clear chat details
//       // clearChatDetails(chatId);
//       res.status(200).json({ message: openaiResponse , chatId });
//     } catch (error) {
//       console.error("Error parsing PDF:", error);
//       res.status(500).json({ message: "Error parsing PDF" });
//     }
//   },
// ];
