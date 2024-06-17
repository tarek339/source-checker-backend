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
exports.clearCookies = void 0;
const clearCookies = (page) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clearing all cookies
        const cookieNames = yield page.evaluate(() => {
            let cookies = [];
            document.cookie.split(";").forEach((cookie) => {
                const name = cookie.split("=")[0].trim();
                cookies.push({ name });
                document.cookie = `${name}=; expires=Thu, 02 Jan 2024 00:00:00 UTC; path=/;`;
            });
            return cookies;
        });
        // Clearing specific cookies
        yield page.deleteCookie(...cookieNames);
        // Cookies have been cleared successfully
        return true;
    }
    catch (error) {
        console.error("Error clearing cookies:", error);
        return false;
    }
});
exports.clearCookies = clearCookies;
