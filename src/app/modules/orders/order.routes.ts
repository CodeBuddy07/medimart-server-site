import express from "express";
import upload from "../../utils/multer";
import { getAllOrders, getOrderById, getUserOrders, getUserOrdersById, removeOrder, updateOrderStatus } from "./order.controllers";
import verifyUser from "../../middlewares/verifyUser";
import { verifyAdmin } from "../../middlewares/verifyAdmin";
import { createOrderAndInitiatePayment, paymentIPN, validatePayment } from "../payment/payment.controller";


const orderRouter = express.Router();

orderRouter.get("/", verifyAdmin, getAllOrders);
orderRouter.get("/user", verifyUser, getUserOrders);
orderRouter.get("/user/:id", verifyUser, verifyAdmin, getUserOrdersById);
orderRouter.get("/:id", verifyAdmin, getOrderById);
orderRouter.put("/:id", verifyAdmin, updateOrderStatus);
orderRouter.delete("/:id", verifyAdmin, removeOrder);
orderRouter.post('/initiate', verifyUser, upload.single("prescription"), createOrderAndInitiatePayment);
orderRouter.get('/validate/:tran_id', validatePayment);
orderRouter.post('/ipn', paymentIPN);


export default orderRouter;
