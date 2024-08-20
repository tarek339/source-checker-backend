"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Survey = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const surveySchema = new mongoose_1.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    validUntil: {
        type: Date,
        default: null,
    },
    anonymousResults: {
        type: Boolean,
    },
    freeUserNames: {
        type: Boolean,
    },
    selectedSurveysOption: {
        type: String,
        default: "Rating",
    },
    selectedResultsOption: {
        type: String,
        default: "After survery",
    },
    surveyId: {
        type: String,
    },
    surveyPin: {
        type: String,
    },
    link: {
        type: String,
    },
    isStarted: {
        type: Boolean,
        default: false,
    },
    pageNum: {
        type: Number,
        default: 1,
    },
    pages: [
        {
            title: {
                type: String,
            },
            url: {
                type: String,
            },
            note: {
                type: String,
            },
            isMobileView: {
                default: null,
                type: Boolean,
            },
            isOpenGraphView: {
                default: false,
                type: Boolean,
            },
            mobileScreenshot: {
                type: String,
                default: "",
            },
            desktopScreenshot: {
                type: String,
                default: "",
            },
            openGraph: {
                type: JSON,
            },
            starsArray: [
                {
                    studentId: {
                        type: String,
                    },
                    userName: {
                        type: String,
                    },
                    userNumber: {
                        type: String,
                    },
                    stars: {
                        type: Number,
                    },
                },
            ],
        },
    ],
});
exports.Survey = ((_a = mongoose_1.default.models) === null || _a === void 0 ? void 0 : _a.Survey) || mongoose_1.default.model("Survey", surveySchema);
