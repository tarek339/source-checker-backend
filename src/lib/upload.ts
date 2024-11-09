import fs from "fs";
require("dotenv").config();

export const uploadImg = (img: Buffer, imgName: string) => {
  const screenshot = imgName;
  const filePath = process.env.ROOT_TO_DIRECTORY + screenshot;
  fs.writeFileSync(filePath, img);
  return filePath;
};
