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
exports.scrapOpenGraph = void 0;
const open_graph_scraper_1 = __importDefault(require("open-graph-scraper"));
const scrapOpenGraph = (
// firstURL: string,
// secondURL: string,
// secondURLArr: any[]
url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const firstRes = await fetch(firstURL);
        // const firstData = await firstRes.json();
        // firstURLArr.push(firstData);
        // const secondRes = await fetch(secondURL);
        // const secondData = await secondRes.json();
        // secondURLArr.push(secondData);
        const options = { url: url };
        const data = yield (0, open_graph_scraper_1.default)(options);
        const { result } = data;
        return result;
    }
    catch (error) {
        console.log(error);
    }
});
exports.scrapOpenGraph = scrapOpenGraph;
