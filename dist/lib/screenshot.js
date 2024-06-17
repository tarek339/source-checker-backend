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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureScreenshot = void 0;
const path_1 = __importDefault(require("path"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const adblocker_puppeteer_1 = require("@cliqz/adblocker-puppeteer");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const deleteCookies_1 = require("./deleteCookies");
const autoconsent = require("@duckduckgo/autoconsent/dist/autoconsent.puppet.js");
const extraRules = require("@duckduckgo/autoconsent/rules/rules.json");
const consentomatic = extraRules.consentomatic;
const rules = [
    ...autoconsent.rules,
    ...Object.keys(consentomatic).map((name) => new autoconsent.ConsentOMaticCMP(`com_${name}`, consentomatic[name])),
    ...extraRules.autoconsent.map((spec) => autoconsent.createAutoCMP(spec)),
];
const captureScreenshot = (size, url) => __awaiter(void 0, void 0, void 0, function* () {
    const blocker = yield adblocker_puppeteer_1.PuppeteerBlocker.fromLists(cross_fetch_1.default, [
        "https://secure.fanboy.co.nz/fanboy-cookiemonster.txt",
    ]);
    let browser = yield puppeteer_1.default.launch({ headless: true });
    let page = yield browser.newPage();
    yield blocker.enableBlockingInPage(page);
    yield page.setViewport(size);
    page.once("load", () => __awaiter(void 0, void 0, void 0, function* () {
        const tab = autoconsent.attachToPage(page, url, rules, 10);
        try {
            yield tab.checked;
            yield tab.doOptIn();
        }
        catch (e) { }
    }));
    yield page.goto(url, {
        waitUntil: ["load", "domcontentloaded", "networkidle0"],
    });
    yield page.screenshot({
        path: "screenshot.jpg",
    });
    yield (0, deleteCookies_1.clearCookies)(page);
    yield browser.close();
    const file = path_1.default.join(__dirname, "../../screenshot.jpg");
    const fileContent = fs_1.default.readFileSync(file);
    return fileContent;
});
exports.captureScreenshot = captureScreenshot;
