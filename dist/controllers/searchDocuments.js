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
exports.searchDocument = void 0;
require("dotenv/config");
const functions_1 = require("./functions");
exports.searchDocument = [
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { searchText, chatId } = req.body;
        if (!searchText) {
            console.error("Error: searchText is undefined");
            return res.status(400).send("'searchText' is a required property");
        }
        console.log("search this:", searchText);
        try {
            const titles = yield (0, functions_1.generateContext)(searchText);
            const newChatId = chatId || (0, functions_1.generateConversationId)();
            // console.log("CONTEXT : ", titles);
            res.status(200).json({
                message: "Form submitted successfully",
                titles: titles.titles,
                chatId: newChatId,
            });
        }
        catch (error) {
            console.error("Error parsing PDF:", error);
            res.status(500).send("Error parsing PDF");
        }
    }),
];
