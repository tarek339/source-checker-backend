import path from "path";
import puppeteer, { Page } from "puppeteer";
import fs from "fs";
import { PuppeteerBlocker } from "@cliqz/adblocker-puppeteer";
import fetch from "cross-fetch";
const autoconsent = require("@duckduckgo/autoconsent/dist/autoconsent.puppet.js");
const extraRules = require("@duckduckgo/autoconsent/rules/rules.json");

const consentomatic = extraRules.consentomatic;
const rules = [
  ...autoconsent.rules,
  ...Object.keys(consentomatic).map(
    (name) =>
      new autoconsent.ConsentOMaticCMP(`com_${name}`, consentomatic[name])
  ),
  ...extraRules.autoconsent.map((spec: any) => autoconsent.createAutoCMP(spec)),
];

export const captureScreenshot = async (
  size: {
    width: number;
    height: number;
  },
  url: string
) => {
  const blocker = await PuppeteerBlocker.fromLists(fetch, [
    "https://secure.fanboy.co.nz/fanboy-cookiemonster.txt",
  ]);

  let browser = await puppeteer.launch({ headless: false });

  let page = await browser.newPage();
  await blocker.enableBlockingInPage(page);

  await page.setViewport(size);

  page.once("load", async () => {
    const tab = autoconsent.attachToPage(page, url, rules, 10);
    try {
      await tab.checked;
      await tab.doOptIn();
    } catch (e) {
      // console.warn(`CMP error`, e);
    }
  });

  await page.goto(url, {
    waitUntil: ["load", "domcontentloaded", "networkidle0"],
  });

  // zoom out before screenshot

  await page.screenshot({
    path: "screenshot.jpg",
  });

  await clearCookies(page);

  await browser.close();

  const file = path.join(__dirname, "../../screenshot.jpg");
  const fileContent = fs.readFileSync(file);

  return fileContent;
};

async function clearCookies(page: Page) {
  try {
    // Clearing all cookies
    const cookieNames = await page.evaluate(() => {
      let cookies: any[] = [];
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        cookies.push({ name });
        document.cookie = `${name}=; expires=Thu, 02 Jan 2024 00:00:00 UTC; path=/;`;
      });
      return cookies;
    });

    // Clearing specific cookies
    await page.deleteCookie(...cookieNames);

    // Cookies have been cleared successfully
    return true;
  } catch (error) {
    // An error occurred while clearing cookies
    console.error("Error clearing cookies:", error);
    return false;
  }
}
