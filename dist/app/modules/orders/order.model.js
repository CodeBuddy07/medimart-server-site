"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importStar(require("mongoose"));
const medicine_model_1 = __importDefault(require("../medicines/medicine.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const emailSender_1 = require("../../utils/emailSender");
const OrderSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    items: [
        {
            medicine: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Medicine",
                required: [true, "Medicine ID is required"],
            },
            quantity: {
                type: Number,
                required: [true, "Quantity is required"],
                min: [1, "Quantity must be at least 1"],
                validate: {
                    validator: function (value) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const medicine = yield medicine_model_1.default.findById(this.medicine);
                            if (!medicine)
                                return false;
                            return value <= medicine.stock;
                        });
                    },
                    message: "Quantity cannot exceed available stock",
                },
            },
            price: {
                type: Number,
                required: [true, "Price is required"],
                min: [0, "Price cannot be negative"],
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: [true, "Total price is required"],
        min: [0, "Total price cannot be negative"],
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment method is required"],
    },
    deliveryAddress: {
        street: { type: String, required: [true, "Street is required"] },
        city: { type: String, required: [true, "City is required"] },
        state: { type: String, required: [true, "State is required"] },
        postalCode: { type: String, required: [true, "Postal code is required"] },
        country: { type: String, required: [true, "Country is required"] },
    },
    prescription: {
        url: {
            type: String,
        },
        publicId: {
            type: String
        },
    },
    transactionId: {
        type: String,
        unique: true,
    },
    paymentDetails: {
        type: Object,
    },
}, { timestamps: true });
OrderSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (const item of this.items) {
                const medicine = yield medicine_model_1.default.findById(item.medicine);
                if (!medicine)
                    throw new Error(`Medicine not found: ${item.medicine}`);
                if (medicine.stock < item.quantity)
                    throw new Error(`Not enough stock for ${medicine.name}`);
                medicine.stock -= item.quantity;
                yield medicine.save();
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
OrderSchema.post("save", function (order) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_model_1.default.findById(order.user);
            if (user) {
                yield (0, emailSender_1.sendEmail)({
                    to: user.email,
                    subject: "Order Confirmation",
                    html: `Hello ${user.name},<br>Your order has been placed successfully.<br>Order ID: <b>${order._id}</b><br>Thank you for choosing us!`,
                });
            }
        }
        catch (error) {
            console.error("❌ Error sending order email:", error);
        }
    });
});
OrderSchema.pre("findOneAndUpdate", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const update = this.getUpdate();
            if ((update === null || update === void 0 ? void 0 : update.status) === "cancelled") {
                const order = yield this.model.findOne(this.getQuery()).populate("items.medicine");
                if (!order)
                    return next();
                for (const item of order.items) {
                    yield medicine_model_1.default.findByIdAndUpdate(item.medicine._id, {
                        $inc: { stock: item.quantity },
                    });
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
OrderSchema.post("findOneAndUpdate", function (order) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (order) {
                const user = yield user_model_1.default.findById(order.user);
                if (user) {
                    yield (0, emailSender_1.sendEmail)({
                        to: user.email,
                        subject: "Order Update",
                        html: `Hello ${user.name},<br>Your order status has been updated to: <b>${order.status}</b>.<br>Order ID: <b>${order._id}</b>`,
                    });
                }
            }
        }
        catch (error) {
            console.error("❌ Error sending order update email:", error);
        }
    });
});
exports.default = mongoose_1.default.model("Order", OrderSchema);
