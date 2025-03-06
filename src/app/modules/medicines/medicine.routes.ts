import express from "express";
import { addMedicine, deleteMedicine, getAllMedicines, getMedicineById, updateMedicine } from "./medicine.controllers";
import upload from "../../utils/multer";
import { verifyAdmin } from "../../middlewares/verifyAdmin";

const medicineRouter = express.Router();

medicineRouter.post("/add", verifyAdmin, upload.array("images", 5), addMedicine);
medicineRouter.post("/update/:id", verifyAdmin, upload.array("images", 5), updateMedicine);
medicineRouter.delete("/remove/:id", verifyAdmin, deleteMedicine);
medicineRouter.get("/:id", getMedicineById);
medicineRouter.get("/", getAllMedicines);


export default medicineRouter;
