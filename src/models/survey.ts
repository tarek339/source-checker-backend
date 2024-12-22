import mongoose, { Schema } from "mongoose";

const surveySchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    default: () => {
      const today = new Date();
      const fourteenDaysLater = new Date(today.setDate(today.getDate() + 14));
      return fourteenDaysLater;
    },
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
      isSelectedView: {
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
        type: Object,
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

export const Survey =
  mongoose.models?.Survey || mongoose.model("Survey", surveySchema);
