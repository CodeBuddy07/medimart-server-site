"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = require("../utils/AppError");
const authFunctions_1 = require("../utils/authFunctions");
const verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError_1.AppError("Access Denied: No token provided", 401);
    }
    const token = authHeader.split(" ")[1];
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
