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
exports.getStudentsSurvey = exports.getSurveyProfile = exports.deletePage = exports.deleteSurvey = exports.fetchSurvey = exports.editSinglePage = exports.completeSurvey = exports.createSurvey = void 0;
const interfaces_1 = require("../types/interfaces/interfaces");
const survey_1 = require("../models/survey");
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
        survey.link = `https//quellenchecker/${survey._id}.de`;
        yield survey.save();
        // const surveys = await Survey.find();
        // const surveyNumber = surveys.findIndex(
        //   (survey) => survey.surveyNumber === null
        // );
        // if (surveyNumber !== -1) {
        //   survey.surveyNumber = surveyNumber + 1;
        // }
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
    try {
        const survey = yield survey_1.Survey.findOne({ surveyId: req.params.surveyId });
        survey.pages.push(req.body.page);
        yield survey.save();
        res.json({
            message: "survey completed",
            survey,
        });
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.completeSurvey = completeSurvey;
const editSinglePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const survey = yield survey_1.Survey.findById(req.params.id);
    console.log(survey);
    // loop find page id and edit isMobile to true or true as requested
    // res survey
});
exports.editSinglePage = editSinglePage;
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
        res.json(survey);
    }
    catch (error) {
        console.log(error);
    }
});
exports.getSurveyProfile = getSurveyProfile;
const getStudentsSurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("first");
        const survey = yield survey_1.Survey.findById(req.params.id);
        if (!survey) {
            res.status(401).json({
                errorMessage: "ID not registered",
            });
            return;
        }
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.getStudentsSurvey = getStudentsSurvey;
