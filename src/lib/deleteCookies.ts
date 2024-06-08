import { Page } from "puppeteer";

export const clearCookies = async (page: Page) => {
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
    console.error("Error clearing cookies:", error);
    return false;
  }
};
