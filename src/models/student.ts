import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  surveyId: {
    type: Schema.Types.ObjectId,
    ref: "Survey",
  },
  freeUserName: {
    type: String,
    default: "",
  },
  userNumber: {
    type: Number,
  },
  isNameRegistered: {
    type: Boolean,
    default: false,
  },
  participated: {
    type: Boolean,
    default: false,
  },
});

export const Student =
  mongoose.models?.Student || mongoose.model("Student", studentSchema);
