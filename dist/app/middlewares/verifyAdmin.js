"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = void 0;
const verifyUser_1 = __importDefault(require("./verifyUser"));
const AppError_1 = require("../utils/AppError");
const verifyAdmin = (req, res, next) => {
    (0, verifyUser_1.default)(req, res, () => {
        var _a;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
            throw new AppError_1.AppError("Admin access required", 403);
        }
        next();
    });
};
exports.verifyAdmin = verifyAdmin;
