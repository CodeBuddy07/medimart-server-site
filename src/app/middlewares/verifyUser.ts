import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../types";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/authFunctions";

const verifyUser: RequestHandler = (req: CustomRequest, res: Response, next: NextFunction) => {

  const token = req.cookies.accessToken;
  console.log("Token:", token);
  if (!token) throw new AppError("Access Denied", 401);
   
  try {
    const decoded: any = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);

  }
};

export default verifyUser;


