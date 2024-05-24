import path from "path";
import puppeteer from "puppeteer";
import fs from "fs";

export const captureScreenshot = async (
  size: {
    width: number;
    height: number;
  },
  url: string
) => {
  const browser = await puppeteer.launch({
    // headless: false,
  });
  const page = await browser.newPage();

  await page.setViewport(size);

  await page.goto(`https://12ft.io/${url}`);

  await page.screenshot({
    path: "screenshot.jpg",
  });

  await browser.close();

  const file = path.join(__dirname, "../../screenshot.jpg");
  const fileContent = fs.readFileSync(file);

  return fileContent;
};
