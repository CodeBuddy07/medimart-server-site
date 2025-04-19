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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MedicineSchema = new mongoose_1.Schema({
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
            validator: function (v) {
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
            validator: function (value) {
                return value.length <= 5; // Max 5 images allowed
            },
            message: "You can upload a maximum of 5 images",
        },
    },
}, {
    timestamps: true,
    strict: true,
});
exports.default = mongoose_1.default.model("Medicine", MedicineSchema);
