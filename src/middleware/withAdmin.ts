import { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";

export const withAdmin = async (
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
      surveyID: string;
    };
    req.body.surveyID = tokenData.surveyID;
    next();
  } catch (error) {
    res.status(422).json({
      message: `Sign in with survey - ${(error as Error).message}`,
    });
  }
};
