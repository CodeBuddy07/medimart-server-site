import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { deleteImage, uploadImage } from "../../utils/cloudinary";
import orderModel from "./order.model";
import { CustomRequest } from "../../types";



export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await orderModel.find().populate("user items.medicine");
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};


export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderModel.findById(req.params.id).populate("user items.medicine");

        if (!order) throw new AppError("Order not found", 404);

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, paymentStatus } = req.body;

        const order = await orderModel.findOneAndUpdate({_id:req.params.id}, { status, paymentStatus }, { new: true});
        if (!order) throw new AppError("Order not found", 404);

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};


export const removeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderModel.findById(req.params.id);

        if (!order) throw new AppError("Order not found", 404);

        if (order.prescription) {
            await deleteImage(order.prescription.publicId);
        }

        await orderModel.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        next(error);
    }
};



export const getUserOrders = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const orders = await orderModel.find({ user: req.user?.id }).populate("items.medicine");

        if (!orders.length) throw new AppError("No orders found for this user", 404);

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

export const getUserOrdersById = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;

        const orders = await orderModel.find({ user: id }).populate("items.medicine");

        console.log(orders);

        if (!orders.length) throw new AppError("No orders found for this user", 404);

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};
