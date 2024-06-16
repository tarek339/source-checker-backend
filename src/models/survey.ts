import mongoose, { Schema } from "mongoose";

const surveySchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    default: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
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
  surveyNumber: {
    type: Number,
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
          stars: {
            type: Number,
          },
        },
      ],
    },
  ],
});

export const Survey =
  mongoose.models?.Survey || mongoose.model("Survey", surveySchema);
