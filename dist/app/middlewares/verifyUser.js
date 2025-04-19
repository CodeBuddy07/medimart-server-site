"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = require("../utils/AppError");
const authFunctions_1 = require("../utils/authFunctions");
const verifyUser = (req, res, next) => {
    const token = req.cookies.accessToken;
    console.log("Token:", token);
    if (!token)
        throw new AppError_1.AppError("Access Denied", 401);
    try {
        const decoded = (0, authFunctions_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.default = verifyUser;
