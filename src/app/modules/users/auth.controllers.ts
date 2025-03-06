import { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "../../utils/AppError";
import { comparePassword, generateRefreshToken, generateToken, verifyRefreshToken } from "../../utils/authFunctions";
import userModel from "./user.model";
import { uploadImage } from "../../utils/cloudinary";


// **🔹 Login (For Both Admin & Customer)**
export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select("+password");
        if (!user) throw new AppError("Invalid email or password", 401);

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) throw new AppError("Invalid email or password", 401);


        const refreshToken = generateRefreshToken({ id: user._id, role: user.role, email:  user.email });
        const accessToken = generateToken({ id: user._id, role: user.role, email:  user.email });


        user.refreshToken = refreshToken;
        await user.save();


        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
        res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
        res.json({
            success: true,
            message: "User Logged in Successfully!",
            accessToken, 
            role: user.role
        });
    } catch (error) {
        next(error);
    }
};


// **🔹 Register User**
export const register: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, phone, address } = req.body;

        await userModel.validate({ name, email, password, phone, address });


        const existingUser = await userModel.findOne({ email });
        if (existingUser) throw new AppError("Email already in use", 400);

        if (!req.files) {
            new AppError('No image uploaded', 400);
        }

        const profileImage = await uploadImage( req.file!);


        const newUser = await userModel.create({
            name,
            email,
            password,
            role: "customer", 
            profileImage,
            phone,
            address,
        });


        const accessToken = generateToken({ id: newUser._id, role: newUser.role, email: newUser.email });
        const refreshToken = generateRefreshToken({ id: newUser._id, role: newUser.role, email: newUser.email });


        newUser.refreshToken = refreshToken;
        await newUser.save();

        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
        res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
        res.status(201).json({
            success: true,
            message: "User registered successfully!",
            accessToken,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                profileImage: newUser.profileImage,
                phone: newUser.phone,
                address: newUser.address,
            }
        });
    } catch (error) {
        next(error);
    }
};

// **🔹 Refresh Token**
export const refreshToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) throw new AppError("No refresh token provided", 401);

        const user = await userModel.findOne({ refreshToken });
        if (!user) throw new AppError("Invalid refresh token", 403);


        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) throw new AppError("Invalid refresh token", 403);


        const newAccessToken = generateToken({ id: user._id, role: user.role, email:  user.email });
        const newRefreshToken = generateRefreshToken({ id: user._id, role: user.role, email:  user.email });


        user.refreshToken = newRefreshToken;
        await user.save();


        res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true });
        res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true });
        res.json({ 
            success: true,
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
        });

    } catch (error) {
        next(error);
    }
};

// **🔹 Logout**
export const logout: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) throw new AppError("No refresh token provided", 401);


        await userModel.findOneAndUpdate({ refreshToken }, { refreshToken: null });


        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        res.json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        next(error);
    }
};

// **🔹 Logout**
export const Update: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { updatedDoc } = req.body;
        const { id } = req.params;

        if (!id || !updatedDoc) throw new AppError("Missing Information.", 404);

        const updatedUser = await userModel.findByIdAndUpdate(id, updatedDoc, { new: true });

        res.clearCookie("accessToken");
        res.json({
            success: true,
            message: "Logged out successfully",
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
};
