import path from "path";
import { Student } from "../models/student";
import { Survey } from "../models/survey";
import fs from "fs";

export const autoDelete = async () => {
  try {
    const surveys = await Survey.find();
    const presentDate = new Date().toLocaleDateString();

    const oldSurveys = surveys.filter((survey) => {
      if (survey.validUntil !== null) {
        return survey.validUntil.toLocaleDateString() === presentDate;
      }
    });

    oldSurveys.forEach(async (survey) => {
      const students = await Student.find({ surveyId: survey._id });

      students.forEach(async (student) => {
        await Student.deleteOne({ _id: student._id });
      });

      await Survey.deleteOne({ _id: survey._id });
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteImages = () => {
  const filePath = process.env.ROOT_TO_DIRECTORY;
  const files = fs.readdirSync(filePath!);
  files.forEach(async (file) => {
    const fullPath = path.join(filePath!, file);
    const { birthtime } = await fs.promises.stat(fullPath);
    const presentDate = new Date();
    const diffTime = Math.abs(presentDate.getTime() - birthtime.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 14) fs.promises.unlink(fullPath);
  });
};
