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
exports.uploadFile = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();
const r2 = new client_s3_1.S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});
const uploadFile = (file, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(r2, new client_s3_1.PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
        }), { expiresIn: 60 * 5 });
        yield fetch(signedUrl, {
            method: "PUT",
            body: file,
        });
        const screenshot = process.env.NEXT_PUBLIC_CLOUDLFARE_URL + "/" + fileName;
        return screenshot;
    }
    catch (error) {
        console.log(error);
    }
});
exports.uploadFile = uploadFile;
