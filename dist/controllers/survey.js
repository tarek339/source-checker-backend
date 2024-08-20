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
exports.getSurveyProfile = exports.deletePage = exports.deleteSurvey = exports.fetchSurvey = exports.choosePageView = exports.completeSurvey = exports.createSurvey = void 0;
const interfaces_1 = require("../types/interfaces/interfaces");
const survey_1 = require("../models/survey");
const screenshot_1 = require("../lib/screenshot");
const upload_1 = require("../lib/upload");
const uuid_1 = require("uuid");
const scrapOpenGraph_1 = require("../lib/scrapOpenGraph");
const socket_1 = require("../socket");
const student_1 = require("../models/student");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("dotenv").config();
const createSurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = new survey_1.Survey({
            anonymousResults: req.body.anonymousResults,
            freeUserNames: req.body.freeUserNames,
            selectedSurveysOption: req.body.selectedSurveysOption,
            selectedResultsOption: req.body.selectedResultsOption,
            surveyId: Math.floor(100000 + Math.random() * 900000),
            surveyPin: Math.floor(100000 + Math.random() * 900000),
            link: "",
            surveyNumber: Math.floor(1000 + Math.random() * 9000),
        });
        yield survey_1.Survey.findById(survey._id);
        survey.link = `${process.env.WEB_SERVER_URL}/register-student/${survey._id}`;
        yield survey.save();
        res.json({
            message: "survey created",
            survey: {
                _id: survey._id,
                anonymousResults: survey.anonymousResults,
                freeUserNames: survey.freeUserNames,
                selectedSurveysOption: survey.selectedSurveysOption,
                selectedResultsOption: survey.selectedResultsOption,
                surveyId: survey.surveyId,
                surveyPin: survey.surveyPin,
                link: survey.link,
                surveyNumber: survey.surveyNumber,
            },
        });
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.createSurvey = createSurvey;
const completeSurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const survey = yield survey_1.Survey.findOne({ surveyId: req.params.surveyId });
    try {
        const mobileContent = yield (0, screenshot_1.captureScreenshot)({
            width: 425,
            height: 1000,
        }, req.body.page.url);
        const desktopContent = yield (0, screenshot_1.captureScreenshot)({
            width: 1024,
            height: 1300,
        }, req.body.page.url);
        const mobileScreenshot = (0, upload_1.uploadImg)(mobileContent, (0, uuid_1.v4)() + ".jpg");
        const desktopScreenshot = (0, upload_1.uploadImg)(desktopContent, (0, uuid_1.v4)() + ".jpg");
        req.body.page.mobileScreenshot = mobileScreenshot.replace(process.env.ROOT_TO_DIRECTORY, process.env.WEB_SERVER_URL + "/images/");
        req.body.page.desktopScreenshot = desktopScreenshot.replace(process.env.ROOT_TO_DIRECTORY, process.env.WEB_SERVER_URL + "/images/");
        const openGraphData = yield (0, scrapOpenGraph_1.scrapOpenGraph)(req.body.page.url);
        req.body.page.openGraph = openGraphData;
        survey.pages.push(req.body.page);
        yield survey.save();
        res.json({
            message: "screenshots and open graph data successfully created",
            survey,
        });
    }
    catch (error) {
        console.log("timeoutError", error);
        try {
            const openGraphData = yield (0, scrapOpenGraph_1.scrapOpenGraph)(req.body.page.url);
            req.body.page.openGraph = openGraphData;
            survey.pages.push(req.body.page);
            yield survey.save();
            res.json({
                message: "Unable to caputure screenshots for this website. Created open graph data only.",
                survey,
            });
        }
        catch (error) {
            console.log("Unable to create screeshots and open graph data. Please try another website!", error);
            res.status(422).json({
                message: "Unable to create screeshots and open graph data. Please try another website!",
            });
        }
    }
});
exports.completeSurvey = completeSurvey;
const choosePageView = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_1.Survey.findById(req.params.id);
        const foundPage = survey.pages.find((page) => String(page._id) === req.body.pageID);
        foundPage.isMobileView = req.body.isMobileView;
        foundPage.isOpenGraphView = req.body.openGraphView;
        yield survey.save();
        res.json({
            message: "page view choosed",
            survey,
        });
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.choosePageView = choosePageView;
const fetchSurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_1.Survey.findOne({
            surveyId: req.body.surveyId,
            surveyPin: req.body.surveyPin,
        });
        if (!survey) {
            res.status(401).json({
                errorMessage: "Wrong ID or PIN",
            });
            return;
        }
        res.json({
            survey,
        });
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.fetchSurvey = fetchSurvey;
const deleteSurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_1.Survey.findById(req.params.id);
        survey === null || survey === void 0 ? void 0 : survey.pages.forEach((page) => {
            const filePath = process.env.ROOT_TO_DIRECTORY;
            const files = fs_1.default.readdirSync(filePath);
            files.forEach((file) => {
                const fullPath = path_1.default.join(filePath, file);
                if (page.mobileScreenshot.includes(file)) {
                    fs_1.default.promises.unlink(fullPath);
                }
                if (page.desktopScreenshot.includes(file)) {
                    fs_1.default.promises.unlink(fullPath);
                }
            });
        });
        const students = yield student_1.Student.find({ surveyId: req.params.id });
        students.forEach((student) => __awaiter(void 0, void 0, void 0, function* () {
            yield student_1.Student.deleteOne({ _id: student._id });
        }));
        yield survey_1.Survey.findByIdAndDelete(req.params.id);
        res.json({
            message: "survey deleted",
        });
    }
    catch (err) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(err),
        });
    }
});
exports.deleteSurvey = deleteSurvey;
const deletePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_1.Survey.findOne({ "pages._id": req.params.id });
        survey.pages = survey.pages.filter((page, i) => {
            return page._id != req.params.id;
        });
        survey.pageNum = 1;
        yield survey.save();
        res.json({
            message: "page deleted",
        });
    }
    catch (err) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(err),
        });
    }
});
exports.deletePage = deletePage;
const getSurveyProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_1.Survey.findById(req.params.id);
        if (survey) {
            socket_1.io === null || socket_1.io === void 0 ? void 0 : socket_1.io.emit("surveyStatusChanged", {
                surveyId: survey._id,
                isStarted: survey.isStarted,
            });
            socket_1.io === null || socket_1.io === void 0 ? void 0 : socket_1.io.emit("surveyPageNumber", {
                surveyId: survey._id,
                pageNum: survey.pageNum,
            });
        }
        res.json({ survey });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getSurveyProfile = getSurveyProfile;
