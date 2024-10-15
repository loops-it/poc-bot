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
exports.submitDocument = exports.renderForm = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const multer_1 = __importDefault(require("multer"));
require("dotenv/config");
const functions_1 = require("./functions");
const upload = (0, multer_1.default)();
// render form view
const renderForm = (req, res) => {
    res.render("upload_documents", { title: "Upload Form" });
};
exports.renderForm = renderForm;
// submit controller
exports.submitDocument = [
    upload.single("pdf"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { title, category } = req.body;
        const pdf = req.file;
        if (!pdf) {
            return res.status(400).send("No file uploaded.");
        }
        try {
            const dataBuffer = pdf.buffer;
            const data = yield (0, pdf_parse_1.default)(dataBuffer);
            console.log(title);
            console.log(category);
            yield (0, functions_1.processAndUpsertText)(data.text, title, category);
            res.status(200).json({
                message: "Form submitted successfully",
                pdfText: data.text,
            });
        }
        catch (error) {
            console.error("Error parsing PDF:", error);
            res.status(500).send("Error parsing PDF");
        }
    }),
];
