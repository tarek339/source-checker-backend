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
        default: false,
        type: Boolean,
      },
    },
  ],
});

export const Survey =
  mongoose.models?.Survey || mongoose.model("Survey", surveySchema);
