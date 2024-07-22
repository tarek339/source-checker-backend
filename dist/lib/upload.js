"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImg = void 0;
const fs_1 = __importDefault(require("fs"));
require("dotenv").config();
const uploadImg = (img, imgName) => {
    const screenshot = imgName;
    const filePath = process.env.ROOT_TO_DIRECTORY + screenshot;
    console.log("root", process.env.ROOT_TO_DIRECTORY);
    console.log("sh", screenshot);
    console.log("path", filePath);
    fs_1.default.writeFile(filePath, img, (err) => {
        console.log(err);
    });
    return filePath;
};
exports.uploadImg = uploadImg;
