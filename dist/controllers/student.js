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
exports.fetchStudentSurvey = exports.fetchStudents = exports.fetchSingleStudent = exports.registerUserName = void 0;
const student_1 = require("../models/student");
const interfaces_1 = require("../types/interfaces/interfaces");
const survey_1 = require("../models/survey");
const registerUserName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentExists = yield student_1.Student.findOne({
            freeUserName: req.body.freeUserName.toLowerCase(),
        });
        if (studentExists) {
            res.status(401).json({
                errorMessage: "student allready exists",
            });
            return;
        }
        const student = new student_1.Student({
            surveyId: req.body.surveyId,
            freeUserName: req.body.freeUserName === ""
                ? null
                : req.body.freeUserName.toLowerCase(),
            userNumber: Math.floor(1000 + Math.random() * 9000),
            isNameRegistered: true,
        });
        yield student.save();
        res.json({ message: "user name created", student });
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.registerUserName = registerUserName;
const fetchSingleStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield student_1.Student.findById(req.params.studentId);
        res.json({ student });
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.fetchSingleStudent = fetchSingleStudent;
const fetchStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield student_1.Student.find({ surveyId: req.params.id });
        res.json({ students });
    }
    catch (error) {
        res.status(422).json({
            message: (0, interfaces_1.mongooseErrorHandler)(error),
        });
    }
});
exports.fetchStudents = fetchStudents;
const fetchStudentSurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_1.Survey.findOne({ surveyId: req.body.surveyId });
        if (!survey) {
            res.status(401).json({
                errorMessage: "Wrong ID",
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
exports.fetchStudentSurvey = fetchStudentSurvey;
