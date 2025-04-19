import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { deleteImage, uploadImage } from "../../utils/cloudinary";
import medicineModel from "./medicine.model";

const getPaginationOptions = (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};


export const addMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, price, stock, requiredPrescription, manufacturer, symptoms, category } = req.body;


        if (!req.files || !Array.isArray(req.files)) {
            throw new AppError("At least one image must be uploaded", 400);
        }

        await medicineModel.validate({ name, description, price, stock, requiredPrescription, manufacturer: JSON.parse(manufacturer), symptoms, category });

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
    } catch (error) {
        next(error);
    }
};


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


export const getAllMedicines = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, skip } = getPaginationOptions(req);
        const { search, category, minPrice, maxPrice, requiredPrescription } = req.query;

        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search as string, $options: 'i' } },
                { description: { $regex: search as string, $options: 'i' } },
                { symptoms: { $regex: search as string, $options: 'i' } }
            ];
        }

        if (category && category !== 'all') {
            query.$or = [ { category: { $regex: category.toString().replace("-"," ") as string, $options: 'i' } }]
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (requiredPrescription !== undefined) {
            query.requiredPrescription = requiredPrescription === 'true';
        }

       
        const total = await medicineModel.countDocuments(query);

        
        const medicines = await medicineModel.find(query)
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
    } catch (error) {
        next(error);
    }
};


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


export const updateMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {


        const medicine = await medicineModel.findById(req.params.id);
        if (!medicine) throw new AppError("Medicine not found", 404);

        let updatedData = { ...req.body };

        if (updatedData.manufacturer) {
            updatedData.manufacturer = JSON.parse(updatedData.manufacturer);
        }
    
        if (updatedData.symptoms) {
            updatedData.symptoms = JSON.parse(updatedData.symptoms);
        }
    
        
        if (req.files && Array.isArray(req.files)) {
            if (((medicine.images.length - (req.body.deleteImages? JSON.parse(req.body.deleteImages).length : 0)) + req.files.length) > 5) {
                throw new AppError("Medicine can contain a maximum of 5  images", 400);
            }

            if ( req.body.deleteImages ) {
                
                const deleteImages =  JSON.parse(req.body.deleteImages); 
                await Promise.all(deleteImages.map(async (publicId: string) => deleteImage(publicId)));
                medicine.images = medicine.images.filter(img => !deleteImages.includes(img.publicId)) as [{ url: string; publicId: string; }];
            }
            
            const uploadedImages = await Promise.all(
                req.files.map(async (file: Express.Multer.File) => {
                    const uploaded = await uploadImage(file);
                    return uploaded;
                })
            );
           
            

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