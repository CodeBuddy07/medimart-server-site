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
exports.GetMe = exports.GetAllUsers = exports.Update = exports.refreshToken = exports.register = exports.login = void 0;
const AppError_1 = require("../../utils/AppError");
const authFunctions_1 = require("../../utils/authFunctions");
const user_model_1 = __importDefault(require("./user.model"));
const cloudinary_1 = require("../../utils/cloudinary");
const mongoose_1 = __importDefault(require("mongoose"));
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_model_1.default.findOne({ email }).select("+password");
        if (!user)
            throw new AppError_1.AppError("Invalid email or password", 401);
        const isMatch = yield (0, authFunctions_1.comparePassword)(password, user.password);
        if (!isMatch)
            throw new AppError_1.AppError("Invalid email or password", 401);
        const refreshToken = (0, authFunctions_1.generateRefreshToken)({ id: user._id, role: user.role, email: user.email });
        const accessToken = (0, authFunctions_1.generateToken)({ id: user._id, role: user.role, email: user.email });
        user.refreshToken = refreshToken;
        yield user.save();
        res.json({
            success: true,
            message: "User Logged in Successfully!",
            accessToken,
            refreshToken,
            role: user.role
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone, address } = req.body;
        yield user_model_1.default.validate({ name, email, password, phone, address });
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser)
            throw new AppError_1.AppError("Email already in use", 400);
        if (!req.files) {
            new AppError_1.AppError('No image uploaded', 400);
        }
        const profileImage = yield (0, cloudinary_1.uploadImage)(req.file);
        const newUser = yield user_model_1.default.create({
            name,
            email,
            password,
            role: "customer",
            profileImage,
            phone,
            address,
        });
        const accessToken = (0, authFunctions_1.generateToken)({ id: newUser._id, role: newUser.role, email: newUser.email });
        const refreshToken = (0, authFunctions_1.generateRefreshToken)({ id: newUser._id, role: newUser.role, email: newUser.email });
        newUser.refreshToken = refreshToken;
        yield newUser.save();
        res.status(201).json({
            success: true,
            message: "User registered successfully!",
            accessToken,
            refreshToken,
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
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken)
            throw new AppError_1.AppError("No refresh token provided", 401);
        const user = yield user_model_1.default.findOne({ refreshToken });
        if (!user)
            throw new AppError_1.AppError("Invalid refresh token", 403);
        const decoded = (0, authFunctions_1.verifyRefreshToken)(refreshToken);
        if (!decoded)
            throw new AppError_1.AppError("Invalid refresh token", 403);
        const newAccessToken = (0, authFunctions_1.generateToken)({ id: user._id, role: user.role, email: user.email });
        const newRefreshToken = (0, authFunctions_1.generateRefreshToken)({ id: user._id, role: user.role, email: user.email });
        user.refreshToken = newRefreshToken;
        yield user.save();
        res.json({
            success: true,
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.refreshToken = refreshToken;
// export const logout: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { refreshToken } = req.cookies;
//         // if (!refreshToken) throw new AppError("No refresh token provided", 401);
//         await userModel.findOneAndUpdate({ refreshToken }, { refreshToken: null });
//         res.clearCookie("refreshToken");
//         res.clearCookie("accessToken");
//         res.json({
//             success: true,
//             message: "Logged out successfully"
//         });
//     } catch (error) {
//         next(error);
//     }
// };
const Update = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const { id } = req.params;
        console.log();
        if (!id || !data)
            throw new AppError_1.AppError("Missing Information.", 404);
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(id, data, { new: true });
        res.json({
            success: true,
            message: "user updated successfully",
            user: updatedUser
        });
    }
    catch (error) {
        next(error);
    }
});
exports.Update = Update;
const GetAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
            throw new AppError_1.AppError("Invalid pagination parameters", 400);
        }
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const total = yield user_model_1.default.countDocuments(query);
        const users = yield user_model_1.default.find(query)
            .select("-password -refreshToken -__v")
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: {
                users,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(total / limitNumber)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.GetAllUsers = GetAllUsers;
const GetMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new AppError_1.AppError("Invalid user ID format", 400);
        }
        const user = yield user_model_1.default.findById(id)
            .select("-password -refreshToken -__v -createdAt -updatedAt");
        if (!user) {
            throw new AppError_1.AppError("User not found", 404);
        }
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: user
        });
    }
    catch (error) {
        next(error);
    }
});
exports.GetMe = GetMe;
