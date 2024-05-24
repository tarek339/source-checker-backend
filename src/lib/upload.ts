import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
require("dotenv").config();

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export const uploadFile = async (file: Buffer, fileName: string) => {
  try {
    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
      }),
      { expiresIn: 60 * 5 }
    );

    console.log(signedUrl);

    await fetch(signedUrl, {
      method: "PUT",
      body: file,
    });

    const screenshot = process.env.NEXT_PUBLIC_CLOUDLFARE_URL + "/" + fileName;

    return screenshot;
  } catch (error) {
    console.log(error);
  }
};
