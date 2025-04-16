import express from "express";
import upload from "../../utils/multer";
import { createOrder, getAllOrders, getOrderById, getUserOrders, getUserOrdersById, removeOrder, updateOrderStatus } from "./order.controllers";
import verifyUser from "../../middlewares/verifyUser";
import { verifyAdmin } from "../../middlewares/verifyAdmin";


const orderRouter = express.Router();

orderRouter.post("/", verifyUser, upload.single("prescription"), createOrder);
orderRouter.get("/", verifyAdmin, getAllOrders);
orderRouter.get("/user", verifyUser, getUserOrders);
orderRouter.get("/user/:id", verifyUser, verifyAdmin, getUserOrdersById);
orderRouter.get("/:id", verifyAdmin, getOrderById);
orderRouter.put("/:id", verifyAdmin, updateOrderStatus);
orderRouter.delete("/:id", verifyAdmin, removeOrder);


export default orderRouter;
