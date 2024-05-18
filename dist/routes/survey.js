"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const survey_1 = require("../controllers/survey");
exports.router = express_1.default.Router();
exports.router.post("/create", survey_1.createSurvey);
exports.router.post("/fetch", survey_1.fetchSurvey);
exports.router.delete("/delete/:id", survey_1.deleteSurvey);
exports.router.put("/complete/:surveyId", survey_1.completeSurvey);
exports.router.post("/delete-page/:id", survey_1.deletePage);
exports.router.get("/get-profile/:id", survey_1.getSurveyProfile);
exports.router.post("/students-survey", survey_1.getStudentsSurvey);
exports.router.put("/edit-single-page/:id", survey_1.editSinglePage);
