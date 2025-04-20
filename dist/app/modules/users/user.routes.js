"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controllers_1 = require("./auth.controllers");
const multer_1 = __importDefault(require("../../utils/multer"));
const verifyAdmin_1 = require("../../middlewares/verifyAdmin");
const verifyUser_1 = __importDefault(require("../../middlewares/verifyUser"));
const userRoutes = express_1.default.Router();
userRoutes.post("/login", auth_controllers_1.login);
userRoutes.post("/refresh", auth_controllers_1.refreshToken);
userRoutes.post("/register", multer_1.default.single("Image"), auth_controllers_1.register);
userRoutes.post("/update/:id", verifyUser_1.default, verifyAdmin_1.verifyAdmin, auth_controllers_1.Update);
userRoutes.get("/me", verifyUser_1.default, auth_controllers_1.GetMe);
userRoutes.get("/", verifyUser_1.default, verifyAdmin_1.verifyAdmin, auth_controllers_1.GetAllUsers);
exports.default = userRoutes;
