import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { deleteImage, uploadImage } from "../../utils/cloudinary";
import medicineModel from "./medicine.model";


// ✅ Add Medicine with Image Upload
export const addMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, price, stock, requiredPrescription, manufacturer, symptoms, category } = req.body;

        if (!req.files || !Array.isArray(req.files)) {
            throw new AppError("At least one image must be uploaded", 400);
        }

        await medicineModel.validate({ name, description, price, stock, requiredPrescription, manufacturer, symptoms, category });


        const images = await Promise.all(
            req.files.map(async (file: Express.Multer.File) => {
                const uploaded = await uploadImage(file);
                return uploaded;
            })
        );


        const newMedicine = await medicineModel.create({
            name,
            description,
            price,
            stock,
            requiredPrescription,
            manufacturer,
            symptoms,
            category,
            images
        });

        res.status(201).json({
            success: true,
            message: "Medicine added successfully",
            data: newMedicine,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Delete Medicine & Images
export const deleteMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const medicine = await medicineModel.findById(req.params.id);
        if (!medicine) throw new AppError("Medicine not found", 404);


        await Promise.all(medicine.images.map(async (img) => deleteImage(img.publicId)));

        await medicineModel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Medicine deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Get all medicines
export const getAllMedicines = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const medicines = await medicineModel.find();
        res.status(200).json({
            success: true,
            message: "Medicines retrieved successfully!",
            count: medicines.length,
            data: medicines,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Get a single medicine by ID
export const getMedicineById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const medicine = await medicineModel.findById(req.params.id);
        if (!medicine) throw new AppError("Medicine not found", 404);

        res.status(200).json({
            success: true,
            message: "Medicine retrieved successfully!",
            data: medicine,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Update a medicine
export const updateMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const medicine = await medicineModel.findById(req.params.id);
        if (!medicine) throw new AppError("Medicine not found", 404);

        let updatedData = { ...req.body };



        
        if (req.files && Array.isArray(req.files)) {

            if ((medicine.images.length + req.files.length) > 5) {
                throw new AppError("Medicine can contain a maximum of 5 images", 400);
            }

            
            const uploadedImages = await Promise.all(
                req.files.map(async (file: Express.Multer.File) => {
                    const uploaded = await uploadImage(file);
                    return uploaded;
                })
            );

           
            if (req.body.deleteImages) {
                const deleteImages = req.body.deleteImages; 

                await Promise.all(deleteImages.map(async (publicId: string) => deleteImage(publicId)));

                medicine.images = medicine.images.filter(img => !deleteImages.includes(img.publicId)) as [{ url: string; publicId: string; }];
            }


            medicine.images = [...medicine.images, ...uploadedImages] as [{ url: string; publicId: string; }];

            updatedData.images = medicine.images; 
        }


        const updatedMedicine = await medicineModel.findByIdAndUpdate(req.params.id, updatedData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Medicine updated successfully",
            data: updatedMedicine,
        });
    } catch (error) {
        next(error);
    }
};

