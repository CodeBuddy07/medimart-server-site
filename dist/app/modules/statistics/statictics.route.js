"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyUser_1 = __importDefault(require("../../middlewares/verifyUser"));
const verifyAdmin_1 = require("../../middlewares/verifyAdmin");
const statistics_controller_1 = require("./statistics.controller");
const statisticsRouter = express_1.default.Router();
statisticsRouter.get('/', verifyUser_1.default, verifyAdmin_1.verifyAdmin, statistics_controller_1.getStatistics);
exports.default = statisticsRouter;
