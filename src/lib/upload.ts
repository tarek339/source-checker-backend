import fs from "fs";
require("dotenv").config();

export const uploadImg = (img: Buffer, imgName: string) => {
  const screenshot = imgName;
  const filePath = "/var/www/assets/screenshots/" + screenshot;
  fs.writeFile(filePath, img, (err) => {
    console.log(err);
  });

  return filePath;
};
