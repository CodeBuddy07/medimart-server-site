import { NextFunction, Request, Response } from 'express';
import orderModel from '../orders/order.model';
import medicineModel from '../medicines/medicine.model';


export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Total Orders Count
    const totalOrders = await orderModel.countDocuments();

    // 2. Orders by Status with Revenue
    const ordersByStatus = await orderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // 3. Revenue Statistics
    const revenueStats = await orderModel.aggregate([
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
    const paymentStatusCounts = await orderModel.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // 5. Medicine Stock Statistics
    const medicineStats = await medicineModel.aggregate([
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
    const topSellingMedicines = await orderModel.aggregate([
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
    const recentOrders = await orderModel.find()
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
  } catch (error) {
    next(error)
  }
};