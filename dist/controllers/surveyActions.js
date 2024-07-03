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
exports.deleteImages = exports.autoDelete = void 0;
const student_1 = require("../models/student");
const survey_1 = require("../models/survey");
const autoDelete = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const surveys = yield survey_1.Survey.find();
        const presentDate = new Date().toLocaleDateString();
        const oldSurveys = surveys.filter((survey) => {
            return survey.validUntil.toLocaleDateString() === presentDate;
        });
        oldSurveys.forEach((survey) => __awaiter(void 0, void 0, void 0, function* () {
            const students = yield student_1.Student.find({ surveyId: survey._id });
            students.forEach((student) => __awaiter(void 0, void 0, void 0, function* () {
                yield student_1.Student.deleteOne({ _id: student._id });
            }));
            yield survey_1.Survey.deleteOne({ _id: survey._id });
        }));
    }
    catch (error) {
        console.log(error);
    }
});
exports.autoDelete = autoDelete;
const deleteImages = () => {
    const fs = require("fs");
    const path = require("path");
    const filePath = "/Root/to/Directory/";
    const files = fs.readdirSync(filePath);
    files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
        const fullPath = path.join(filePath, file);
        const { birthtime } = yield fs.promises.stat(fullPath);
        const presentDate = new Date();
        const diffTime = Math.abs(presentDate.getTime() - birthtime.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 1)
            fs.promises.unlink(fullPath);
    }));
};
exports.deleteImages = deleteImages;
