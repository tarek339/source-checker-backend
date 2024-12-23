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

    for (const survey of oldSurveys) {
      const students = await Student.find({ surveyId: survey._id });

      for (const student of students) {
        await Student.deleteOne({ _id: student._id });
      }
      await Survey.deleteOne({ _id: survey._id });
    }
  } catch (error) {
    console.error(`Autodelete error - ${(error as Error).message}`);
  }
};

export const deleteImages = async () => {
  const filePath = process.env.ROOT_TO_DIRECTORY;

  const files = fs.readdirSync(filePath!);

  for (const file of files) {
    const fullPath = path.join(filePath!, file);

    try {
      const { birthtime } = await fs.promises.stat(fullPath);
      const presentDate = new Date();
      const diffTime = Math.abs(presentDate.getTime() - birthtime.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 14) {
        await fs.promises.unlink(fullPath);
      }
    } catch (error) {
      console.error(
        `Error processing file ${fullPath}:`,
        (error as Error).message
      );
    }
  }
};
