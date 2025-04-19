"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const medicine_controllers_1 = require("./medicine.controllers");
const multer_1 = __importDefault(require("../../utils/multer"));
const verifyAdmin_1 = require("../../middlewares/verifyAdmin");
const medicineRouter = express_1.default.Router();
medicineRouter.post("/add", verifyAdmin_1.verifyAdmin, multer_1.default.array("images", 5), medicine_controllers_1.addMedicine);
medicineRouter.post("/update/:id", verifyAdmin_1.verifyAdmin, multer_1.default.array("images", 5), medicine_controllers_1.updateMedicine);
medicineRouter.delete("/remove/:id", verifyAdmin_1.verifyAdmin, medicine_controllers_1.deleteMedicine);
medicineRouter.get("/:id", medicine_controllers_1.getMedicineById);
medicineRouter.get("/", medicine_controllers_1.getAllMedicines);
exports.default = medicineRouter;
