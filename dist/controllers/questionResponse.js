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
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionResponse = void 0;
require("dotenv/config");
const chatDetailsMemory = {};
const saveChatDetails = (chatId) => {
    chatDetailsMemory[chatId] = { chatId };
};
const getChatDetails = (chatId) => {
    return chatDetailsMemory[chatId];
};
// const clearChatDetails = (chatId: string): void => {
//   delete chatDetailsMemory[chatId];
//   console.log(`Memory cleared for chatId ${chatId}`);
// };
exports.questionResponse = [
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userQuestion, chatId } = req.body;
        if (!userQuestion) {
            console.error("Error: searchText is undefined");
            return res
                .status(400)
                .json({ message: "'userQuestion' is a required property" });
        }
        console.log("user question : ", userQuestion);
        try {
            // const chatId = generateConversationId();
            // console.log("chat ID : ", chatId);
            let openaiResponse = 'HI';
            saveChatDetails(chatId);
            const chatDetails = getChatDetails(chatId);
            // if (chatDetails) {
            //   console.log(`Chat ID: ${chatDetails.chatId}`);
            //   const titles = await generateContextAndAnswer(
            //     userQuestion        );
            //   //   console.log("response : ", titles);
            //   openaiResponse = await searchQueryOpenAI(
            //     titles,
            //     userQuestion
            //           );
            //   console.log("Openai Response : ", openaiResponse);
            // }
            // Clear chat details
            // clearChatDetails(chatId);
            res.status(200).json({ message: openaiResponse, chatId });
        }
        catch (error) {
            console.error("Error parsing PDF:", error);
            res.status(500).json({ message: "Error parsing PDF" });
        }
    }),
];
