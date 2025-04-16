import mongoose, { Schema, Document } from "mongoose";

export interface IMedicine {
    name: string;
    description: string;
    price: number;
    stock: number;
    requiredPrescription: boolean;
    manufacturer: {
        name: string;
        address: string;
        contact: string;
    };
    symptoms: string[];
    category: string;
    images:[
        {
            url: string;
            publicId: string;
        }
    ];
    createdAt?: Date;
    updatedAt?: Date;
}

interface IMedicineModel extends IMedicine, Document { }

const MedicineSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Medicine name is required"],
            trim: true,
            minlength: [2, "Medicine name must be at least 2 characters"],
            maxlength: [100, "Medicine name cannot exceed 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            minlength: [10, "Description should be at least 10 characters long"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        stock: {
            type: Number,
            required: [true, "Stock quantity is required"],
            min: [0, "Stock cannot be negative"],
        },
        requiredPrescription: {
            type: Boolean,
            required: [true, "Required Prescription field is mandatory"],
        },
        manufacturer: {
            name: {
                type: String,
                required: [true, "Manufacturer name is required"],
                trim: true,
            },
            address: {
                type: String,
                required: [true, "Manufacturer address is required"],
            },
            contact: {
                type: String,
                required: [true, "Manufacturer contact is required"],
            },
        },
        symptoms: {
            type: [String],
            required: [true, "At least one symptom must be provided"],
            validate: {
                validator: function (v: string[]) {
                    return v.length > 0;
                },
                message: "Provide at least one symptom",
            },
        },
        category: {
            type: String,
            required: [true, "Category is required"],
        },
        images: {
            type: [
              {
                url: {
                  type: String,
                  required: [true, "Image URL is required"],
                },
                publicId: {
                  type: String,
                  required: [true, "Public ID is required"],
                },
              },
            ],
            validate: {
              validator: function (value: { url: string; publicId: string }[]) {
                return value.length <= 5; // Max 5 images allowed
              },
              message: "You can upload a maximum of 5 images",
            },
          },

    },
    {
        timestamps: true,
        strict: true,
    }
);

export default mongoose.model<IMedicineModel>("Medicine", MedicineSchema);
