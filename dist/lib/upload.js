"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImg = void 0;
const fs_1 = __importDefault(require("fs"));
require("dotenv").config();
const uploadImg = (img, imgName) => {
    const screenshot = process.env.WEB_SERVER_URL + "/" + imgName;
    const filePath = `/Root/to/Directory/${screenshot}`;
    fs_1.default.writeFileSync(filePath, img);
    return filePath;
};
exports.uploadImg = uploadImg;
