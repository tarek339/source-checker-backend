import { Request, Response } from "express";
import { Student } from "../models/student";
import { mongooseErrorHandler, Error } from "../types/interfaces/interfaces";

export const registerUserName = async (req: Request, res: Response) => {
  try {
    const student = new Student({
      surveyId: req.body.surveyId,
      freeUserName: req.body.freeUserName,
      userNumber: Math.floor(1000 + Math.random() * 9000),
      isNameRegistered: true,
    });
    await student.save();

    res.json({ message: "user name created", student });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const fetchSingleStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.studentId);
    res.json({ student });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const fetchStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({ surveyId: req.params.id });

    res.json({ students });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};
