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
exports.getStatistics = void 0;
const order_model_1 = __importDefault(require("../orders/order.model"));
const medicine_model_1 = __importDefault(require("../medicines/medicine.model"));
const getStatistics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Total Orders Count
        const totalOrders = yield order_model_1.default.countDocuments();
        // 2. Orders by Status with Revenue
        const ordersByStatus = yield order_model_1.default.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            }
        ]);
        // 3. Revenue Statistics
        const revenueStats = yield order_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    averageOrderValue: { $avg: '$totalPrice' },
                    minOrderValue: { $min: '$totalPrice' },
                    maxOrderValue: { $max: '$totalPrice' }
                }
            }
        ]);
        // 4. Payment Status Counts
        const paymentStatusCounts = yield order_model_1.default.aggregate([
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 }
                }
            }
        ]);
        // 5. Medicine Stock Statistics
        const medicineStats = yield medicine_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalMedicines: { $sum: 1 },
                    lowStock: {
                        $sum: {
                            $cond: [{ $lte: ['$stock', 5] }, 1, 0]
                        }
                    },
                    outOfStock: {
                        $sum: {
                            $cond: [{ $eq: ['$stock', 0] }, 1, 0]
                        }
                    }
                }
            }
        ]);
        // 6. Top Selling Medicines
        const topSellingMedicines = yield order_model_1.default.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.medicine',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'medicines',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'medicineDetails'
                }
            },
            { $unwind: '$medicineDetails' },
            {
                $project: {
                    name: '$medicineDetails.name',
                    totalQuantity: 1,
                    totalRevenue: 1,
                    image: { $arrayElemAt: ['$medicineDetails.images.url', 0] }
                }
            }
        ]);
        // 7. Recent Orders
        const recentOrders = yield order_model_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .lean();
        const statistics = {
            totalOrders,
            ordersByStatus,
            revenueStats: revenueStats[0] || {},
            paymentStatusCounts,
            medicineStats: medicineStats[0] || {},
            topSellingMedicines,
            recentOrders
        };
        res.status(200).json(statistics);
    }
    catch (error) {
        next(error);
    }
});
exports.getStatistics = getStatistics;
