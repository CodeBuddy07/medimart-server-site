import { Types } from "mongoose";
import mongoose, { Schema, Document } from "mongoose";
import medicineModel from "../medicines/medicine.model";
import userModel from "../users/user.model";
import { sendEmail } from "../../utils/emailSender";

interface IOrder {
    user: Types.ObjectId;
    items: {
        medicine: Types.ObjectId;
        quantity: number;
        price: number;
    }[];
    totalPrice: number;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    paymentStatus: "pending" | "paid" | "failed";
    paymentMethod: "COD" | "Credit Card" | "Debit Card" | "UPI" | "PayPal"| "online";
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    prescription?: {
        url: string;
        publicId: string;
    };

    transactionId?: string; // Add this line
    paymentDetails?: any;

    createdAt?: Date;
    updatedAt?: Date;
}

interface IOrderModel extends IOrder, Document { }

const OrderSchema: Schema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        items: [
            {
                medicine: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Medicine",
                    required: [true, "Medicine ID is required"],
                },
                quantity: {
                  type: Number,
                  required: [true, "Quantity is required"],
                  min: [1, "Quantity must be at least 1"],
                  validate: {
                      validator: async function (value: number) {
                          const medicine = await medicineModel.findById((this as any).medicine);
                          if (!medicine) return false;
                          return value <= medicine.stock; 
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
            enum: ["COD", "Credit Card", "Debit Card", "UPI", "PayPal", "online"],
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
            
    },
    { timestamps: true }
);



OrderSchema.pre("save", async function (next) {
    try {
      for (const item of ((this as unknown) as IOrder & Document).items) {
        const medicine = await medicineModel.findById(item.medicine);
        if (!medicine) throw new Error(`Medicine not found: ${item.medicine}`);
        if (medicine.stock < item.quantity) throw new Error(`Not enough stock for ${medicine.name}`);
  
        medicine.stock -= item.quantity;
        await medicine.save();
      }
      next();
    } catch (error) {
      next(error as Error);
    }
  });
  

  OrderSchema.post("save", async function (order) {
    try {
      const user = await userModel.findById(order.user);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: "Order Confirmation",
          html: `Hello ${user.name},<br>Your order has been placed successfully.<br>Order ID: <b>${order._id}</b><br>Thank you for choosing us!`,
          });
      }
    } catch (error) {
      console.error("❌ Error sending order email:", error);
    }
  });
  

  OrderSchema.pre("findOneAndUpdate", async function (next) {
    try {
      const update = this.getUpdate();
      if ((update as mongoose.UpdateQuery<IOrder>)?.status === "cancelled") {
        const order = await this.model.findOne(this.getQuery()).populate("items.medicine");
  
        if (!order) return next();
  
        for (const item of order.items) {
          await medicineModel.findByIdAndUpdate(item.medicine._id, {
            $inc: { stock: item.quantity },
          });
        }
      }
      next();
    } catch (error) {
      next(error as Error);
    }
  });
  
 
  OrderSchema.post("findOneAndUpdate", async function (order) {
    try {
      if (order) {
        const user = await userModel.findById(order.user);
        if (user) {
          await sendEmail({
            to: user.email,
            subject: "Order Update",
            html: `Hello ${user.name},<br>Your order status has been updated to: <b>${order.status}</b>.<br>Order ID: <b>${order._id}</b>`,
          });
        }
      }
    } catch (error) {
      console.error("❌ Error sending order update email:", error);
    }
  });

export default mongoose.model<IOrderModel>("Order", OrderSchema);

