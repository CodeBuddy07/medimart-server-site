"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrdersById = exports.getUserOrders = exports.removeOrder = exports.updateOrderStatus = exports.getOrderById = exports.getAllOrders = void 0;
const AppError_1 = require("../../utils/AppError");
const cloudinary_1 = require("../../utils/cloudinary");
const order_model_1 = __importDefault(require("./order.model"));
const getAllOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_model_1.default.find().populate("user items.medicine");
        res.status(200).json({ success: true, data: orders });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllOrders = getAllOrders;
const getOrderById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findById(req.params.id).populate("user items.medicine");
        if (!order)
            throw new AppError_1.AppError("Order not found", 404);
        res.status(200).json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
});
exports.getOrderById = getOrderById;
const updateOrderStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, paymentStatus } = req.body;
        const order = yield order_model_1.default.findOneAndUpdate({ _id: req.params.id }, { status, paymentStatus }, { new: true });
        if (!order)
            throw new AppError_1.AppError("Order not found", 404);
        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateOrderStatus = updateOrderStatus;
const removeOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findById(req.params.id);
        if (!order)
            throw new AppError_1.AppError("Order not found", 404);
        if (order.prescription) {
            yield (0, cloudinary_1.deleteImage)(order.prescription.publicId);
        }
        yield order_model_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Order deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.removeOrder = removeOrder;
const getUserOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const orders = yield order_model_1.default.find({ user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }).populate("items.medicine");
        if (!orders.length)
            throw new AppError_1.AppError("No orders found for this user", 404);
        res.status(200).json({ success: true, data: orders });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserOrders = getUserOrders;
const getUserOrdersById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const orders = yield order_model_1.default.find({ id }).populate("items.medicine");
        if (!orders.length)
            throw new AppError_1.AppError("No orders found for this user", 404);
        res.status(200).json({ success: true, data: orders });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserOrdersById = getUserOrdersById;
