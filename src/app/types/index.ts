import { Request } from "express";
import { IUser } from "../modules/users/user.model";

export interface CustomRequest extends Request {
    user?: {
        id:  string;
        role: string;
        email: string;
    };
}