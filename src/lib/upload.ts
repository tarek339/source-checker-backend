import fs from "fs";
require("dotenv").config();

export const uploadImg = (img: Buffer, imgName: string) => {
  const screenshot = imgName;
  const filePath = process.env.ROOT_TO_DIRECTORY + screenshot;
  console.log("root", process.env.ROOT_TO_DIRECTORY);
  console.log("sh", screenshot);
  console.log("path", filePath);
  fs.writeFile(filePath, img, (err) => {
    console.log(err);
  });

  return filePath;
};
