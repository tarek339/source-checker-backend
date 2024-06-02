import { Survey } from "../models/survey";

export const autoDelete = async () => {
  try {
    const surveys = await Survey.find();
    const oldSurveys = surveys.filter((survey) => {
      const presentDate = new Date().toLocaleDateString();
      return survey.validUntil.toLocaleDateString() === presentDate;
    });
    oldSurveys.forEach((survey) => {
      Survey.deleteOne({ _id: survey._id });
    });
  } catch (error) {
    console.log(error);
  }
};
