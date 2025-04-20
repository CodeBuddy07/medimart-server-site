import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../types";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/authFunctions";

const verifyUser: RequestHandler = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Access Denied: No token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyUser;
