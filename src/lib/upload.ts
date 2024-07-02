import fs from "fs";
require("dotenv").config();

export const uploadImg = (img: Buffer, imgName: string) => {
  const screenshot = process.env.WEB_SERVER_URL + "/" + imgName;
  const filePath = `/Root/to/Directory/${screenshot}`;
  fs.writeFileSync(filePath, img);

  return filePath;
};
