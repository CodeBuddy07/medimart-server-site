import { NextFunction, RequestHandler, Response } from "express";
import verifyToken from "./verifyUser";
import { CustomRequest } from "../types";
import { AppError } from "../utils/AppError";


export const verifyAdmin: RequestHandler = (req: CustomRequest, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    if (req.user?.role !== "admin") {
      throw new AppError("Admin access required", 403);
    }
    next();
  });
};