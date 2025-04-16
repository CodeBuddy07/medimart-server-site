import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { generateRefreshToken } from "../../utils/authFunctions";

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: "admin" | "customer";
    profileImage: {
        url: string;
        publicId: string;
    };
    phone: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    refreshToken: string;
    createdAt?: Date;
    updatedAt?: Date;
}




interface IUserModel extends IUser, Document { }

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters long"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        refreshToken: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            immutable: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Invalid email format",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
            select: false, 
        },
        role: {
            type: String,
            enum: {
                values: ["admin", "customer"],
                message: "Role must be either 'admin' or 'customer'",
            },
            default: "customer",
        },
        profileImage: {
            url: {
                type: String,
            },
            publicId: {
                type: String,
            },
        },
        phone: {
            type: String,
            validate: {
                validator: function (v: string) {
                    return /^[+]?[0-9]{10,15}$/.test(v);
                },
                message: "Invalid phone number format",
            },
        },
        address: {
            street: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            postalCode: { type: String, default: "" },
            country: { type: String, default: "" },
        },
    },
    { timestamps: true }
);


UserSchema.pre<IUserModel>("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

  UserSchema.pre("findOneAndUpdate", async function (next) {
    try {
      const update = this.getUpdate();
      if ((update as mongoose.UpdateQuery<IUser>)?.role === "admin" || "customer") {
        ((this as unknown) as IUser).refreshToken = generateRefreshToken({ id: ((this as unknown) as IUser & Document)._id, role: ((this as unknown) as IUser & Document).role, email: ((this as unknown) as IUser & Document).email });
      }
      next();
    } catch (error) {
      next(error as Error);
    }
  });


UserSchema.methods.comparePassword = async function (
    enteredPassword: string
): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUserModel>("User", UserSchema);
