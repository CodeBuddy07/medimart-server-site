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
exports.updateMedicine = exports.getMedicineById = exports.getAllMedicines = exports.deleteMedicine = exports.addMedicine = void 0;
const AppError_1 = require("../../utils/AppError");
const cloudinary_1 = require("../../utils/cloudinary");
const medicine_model_1 = __importDefault(require("./medicine.model"));
const getPaginationOptions = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
const addMedicine = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, stock, requiredPrescription, manufacturer, symptoms, category } = req.body;
        if (!req.files || !Array.isArray(req.files)) {
            throw new AppError_1.AppError("At least one image must be uploaded", 400);
        }
        yield medicine_model_1.default.validate({ name, description, price, stock, requiredPrescription, manufacturer: JSON.parse(manufacturer), symptoms, category });
        const images = yield Promise.all(req.files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const uploaded = yield (0, cloudinary_1.uploadImage)(file);
            return uploaded;
        })));
        const newMedicine = yield medicine_model_1.default.create({
            name,
            description,
            price,
            stock,
            requiredPrescription,
            manufacturer: JSON.parse(manufacturer),
            symptoms,
            category,
            images
        });
        res.status(201).json({
            success: true,
            message: "Medicine added successfully",
            data: newMedicine,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addMedicine = addMedicine;
const deleteMedicine = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const medicine = yield medicine_model_1.default.findById(req.params.id);
        if (!medicine)
            throw new AppError_1.AppError("Medicine not found", 404);
        yield Promise.all(medicine.images.map((img) => __awaiter(void 0, void 0, void 0, function* () { return (0, cloudinary_1.deleteImage)(img.publicId); })));
        yield medicine_model_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Medicine deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteMedicine = deleteMedicine;
const getAllMedicines = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = getPaginationOptions(req);
        const { search, category, minPrice, maxPrice, requiredPrescription } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { symptoms: { $regex: search, $options: 'i' } }
            ];
        }
        if (category && category !== 'all') {
            query.$or = [{ category: { $regex: category.toString().replace("-", " "), $options: 'i' } }];
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice)
                query.price.$gte = Number(minPrice);
            if (maxPrice)
                query.price.$lte = Number(maxPrice);
        }
        if (requiredPrescription !== undefined) {
            query.requiredPrescription = requiredPrescription === 'true';
        }
        const total = yield medicine_model_1.default.countDocuments(query);
        const medicines = yield medicine_model_1.default.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Medicines retrieved successfully!",
            data: medicines,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMedicines = getAllMedicines;
const getMedicineById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const medicine = yield medicine_model_1.default.findById(req.params.id);
        if (!medicine)
            throw new AppError_1.AppError("Medicine not found", 404);
        res.status(200).json({
            success: true,
            message: "Medicine retrieved successfully!",
            data: medicine,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getMedicineById = getMedicineById;
const updateMedicine = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const medicine = yield medicine_model_1.default.findById(req.params.id);
        if (!medicine)
            throw new AppError_1.AppError("Medicine not found", 404);
        let updatedData = Object.assign({}, req.body);
        if (updatedData.manufacturer) {
            updatedData.manufacturer = JSON.parse(updatedData.manufacturer);
        }
        if (updatedData.symptoms) {
            updatedData.symptoms = JSON.parse(updatedData.symptoms);
        }
        if (req.files && Array.isArray(req.files)) {
            if (((medicine.images.length - (req.body.deleteImages ? JSON.parse(req.body.deleteImages).length : 0)) + req.files.length) > 5) {
                throw new AppError_1.AppError("Medicine can contain a maximum of 5  images", 400);
            }
            if (req.body.deleteImages) {
                const deleteImages = JSON.parse(req.body.deleteImages);
                yield Promise.all(deleteImages.map((publicId) => __awaiter(void 0, void 0, void 0, function* () { return (0, cloudinary_1.deleteImage)(publicId); })));
                medicine.images = medicine.images.filter(img => !deleteImages.includes(img.publicId));
            }
            const uploadedImages = yield Promise.all(req.files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                const uploaded = yield (0, cloudinary_1.uploadImage)(file);
                return uploaded;
            })));
            medicine.images = [...medicine.images, ...uploadedImages];
            updatedData.images = medicine.images;
        }
        const updatedMedicine = yield medicine_model_1.default.findByIdAndUpdate(req.params.id, updatedData, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            success: true,
            message: "Medicine updated successfully",
            data: updatedMedicine,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateMedicine = updateMedicine;
