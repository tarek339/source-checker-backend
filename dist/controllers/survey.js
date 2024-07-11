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
exports.getStudentPageStars = exports.pushStarsToArray = exports.setCurrentPage = exports.setSurveyStatus = exports.getSurveyProfile = exports.deletePage = exports.deleteSurvey = exports.fetchSurvey = exports.choosePageView = exports.completeSurvey = exports.createSurvey = void 0;
const interfaces_1 = require("../types/interfaces/interfaces");
const survey_1 = require("../models/survey");
const screenshot_1 = require("../lib/screenshot");
const upload_1 = require("../lib/upload");
const uuid_1 = require("uuid");
const scrapOpenGraph_1 = require("../lib/scrapOpenGraph");
const socket_1 = require("../socket");
const student_1 = require("../models/student");
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
        survey.link = `${process.env.CLIENT_URL}/register-student/${survey._id}`;
        yield survey.save();
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
        console.log("Capture screenshot timeoutError: Navigation timeout of 30000 ms exceeded. Creating open graph data only.");
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
            console.log("Unable to create screeshots and open graph data. Please try another website!");
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
        yield survey_1.Survey.findByIdAndDelete(req.params.id);
        const survey = yield survey_1.Survey.find();
        res.json({
            message: "survey deleted",
            survey,
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
const setSurveyStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_1.Survey.findById(req.params.id);
        survey.isStarted = req.body.isStarted;
        if (req.body.pageNum) {
            survey.pageNum = req.body.pageNum;
        }
        socket_1.io === null || socket_1.io === void 0 ? void 0 : socket_1.io.emit("surveyStatusChanged", {
            surveyId: survey._id,
            isStarted: survey.isStarted,
        });
        survey.pageNum = 1;
        yield survey.save();
        res.json({ survey });
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.setSurveyStatus = setSurveyStatus;
const setCurrentPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_1.Survey.findById(req.params.id);
        survey.pageNum = req.body.pageNum;
        socket_1.io === null || socket_1.io === void 0 ? void 0 : socket_1.io.emit("surveyPageNumber", {
            surveyId: survey._id,
            pageNum: survey.pageNum,
        });
        yield survey.save();
        res.json({ message: "current page set", survey });
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.setCurrentPage = setCurrentPage;
const pushStarsToArray = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_1.Survey.findById(req.params.id);
        const student = yield student_1.Student.findById(req.body.studentId);
        survey.pages.forEach((page) => {
            if (String(page._id) === req.body.pageId) {
                const foundEqual = page.starsArray.find((starsObj) => {
                    return starsObj.studentId === req.body.studentId;
                });
                if (!foundEqual) {
                    page.starsArray.push({
                        studentId: req.body.studentId,
                        userName: student.freeUserName,
                        userNumber: student.userNumber,
                        stars: req.body.stars,
                    });
                }
            }
        });
        yield survey.save();
        res.json({
            message: "stars added",
            survey,
        });
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.pushStarsToArray = pushStarsToArray;
const getStudentPageStars = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_1.Survey.findById(req.params.id);
        let studentStars = 0;
        survey.pages.map((page) => {
            if (String(page._id) === req.params.pageId) {
                const findStars = page.starsArray.find((obj) => {
                    return obj.studentId === req.params.studentId;
                });
                studentStars = findStars === null || findStars === void 0 ? void 0 : findStars.stars;
            }
        });
        res.json(studentStars);
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.getStudentPageStars = getStudentPageStars;
