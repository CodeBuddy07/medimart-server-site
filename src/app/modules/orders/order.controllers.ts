import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { deleteImage, uploadImage } from "../../utils/cloudinary";
import orderModel from "./order.model";
import { CustomRequest } from "../../types";
import medicineModel, { IMedicine } from "../medicines/medicine.model";


// ✅ Create a new order
export const createOrder = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { items, paymentMethod, deliveryAddress } = req.body;
        const user = req.user?.id;

        console.log(req.user);

        if (!items || items.length === 0) {
            throw new AppError("Order must contain at least one item", 400);
        }

        const medicineIds = items.map((item: { medicine: string }) => item.medicine);
        const medicines = await medicineModel.find({ _id: { $in: medicineIds } });

        if (medicines.length !== items.length) {
            throw new AppError("One or more medicines are not found", 400);
        }

        let totalPrice = 0;
        const validatedItems = items.map((item: { medicine: string; quantity: number }) => {
            const medicine = medicines.find((m:any) => m._id.toString() === item.medicine);
            if (!medicine) throw new AppError(`Medicine with ID ${item.medicine} not found`, 400);

            const itemTotal = medicine.price * item.quantity;
            totalPrice += itemTotal;

            return {
                medicine: item.medicine,
                quantity: item.quantity,
                price: medicine.price,
                itemTotal
            };
        });

        await orderModel.validate({user, items, totalPrice, paymentMethod, deliveryAddress})

        let prescription = null;
        if (req.file) {
            prescription = await uploadImage(req.file);
        }

        const order = await orderModel.create({
            user,
            items: validatedItems,
            totalPrice,
            paymentMethod,
            deliveryAddress,
            prescription,
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};


// ✅ Get all orders (Admin)
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await orderModel.find().populate("user items.medicine");
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

// ✅ Get a single order by ID
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderModel.findById(req.params.id).populate("user items.medicine");

        if (!order) throw new AppError("Order not found", 404);

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// ✅ Update order status
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

// ✅ Remove an order
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


// ✅ Get user-specific orders
export const getUserOrders = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        const orders = await orderModel.find({ user: req.user?.id }).populate("items.medicine");

        if (!orders.length) throw new AppError("No orders found for this user", 404);

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};
