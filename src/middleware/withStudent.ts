import { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";

export const withStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.get("Authorization");

    const tokenData = jsonwebtoken.verify(
      token!,
      process.env.SECRET_TOKEN!
    ) as {
      studentId: string;
    };
    req.body.studentId = tokenData.studentId;
    next();
  } catch (error) {
    console.log((error as Error).message);
    res.status(422).json({
      message: `Sign in with student - ${(error as Error).message}`,
    });
  }
};
