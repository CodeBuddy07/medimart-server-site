
import SSLCommerzPayment from 'sslcommerz-lts';
import { AppError } from '../../utils/AppError';
import orderModel from '../orders/order.model';
import userModel from '../users/user.model';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import medicineModel from '../medicines/medicine.model';
import { CustomRequest } from '../../types';
import { uploadImage } from '../../utils/cloudinary';
import config from '../../config';


export const initiateSSLCommerzPayment = async (orderData: any) => {
    try {

        if (!orderData.items || !orderData.items.length || !orderData.user || !orderData.deliveryAddress) {
            throw new AppError("Required fields are missing", 400);
        }

        const tempOrder = new orderModel({
            ...orderData,
            status: 'pending',
            paymentStatus: 'pending'
        });

    
        await tempOrder.validate();
        ;

        const tran_id = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

       
        const user = await userModel.findById(orderData.user);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        const data = {
            total_amount: orderData.totalPrice,
            currency: 'BDT',
            tran_id,
            success_url: `${config.frontendUrl}/payment/success`,
            fail_url: `${config.frontendUrl}/payment/failed`,
            cancel_url: `${config.frontendUrl}/payment/failed`,
            ipn_url: `${config.backendUrl}/api/order/ipn`,
            shipping_method: 'Courier',
            product_name: 'Medicines',
            product_category: 'Healthcare',
            product_profile: 'general',
            cus_name: user.name,
            cus_email: user.email,
            cus_add1: orderData.deliveryAddress.street,
            cus_add2: '',
            cus_city: orderData.deliveryAddress.city,
            cus_state: orderData.deliveryAddress.state,
            cus_postcode: orderData.deliveryAddress.postalCode,
            cus_country: orderData.deliveryAddress.country,
            cus_phone: user.phone || 'N/A',
            ship_name: user.name,
            ship_add1: orderData.deliveryAddress.street,
            ship_add2: '',
            ship_city: orderData.deliveryAddress.city,
            ship_state: orderData.deliveryAddress.state,
            ship_postcode: orderData.deliveryAddress.postalCode,
            ship_country: orderData.deliveryAddress.country,
            value_a: orderData._id // Store order ID for validation
        };

        const storeId = config.sslCommerze.storeId;
        const storePassword = config.sslCommerze.storePassword;
        const isLive = config.sslCommerze.isLive;

        
        tempOrder.transactionId = tran_id;
        await tempOrder.save();

        const sslcommerz = new SSLCommerzPayment(storeId, storePassword, isLive)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiResponse = await sslcommerz.init(data);
        console.log("API Response:", apiResponse);
        if (!apiResponse.GatewayPageURL) {
            throw new AppError("Failed to generate payment URL", 500);
        }
        return {
            paymentUrl: apiResponse.GatewayPageURL,
            transactionId: tran_id,
            orderId: tempOrder._id
        };

    } catch (error) {
        throw error;
    }
};

export const validateSSLCommerzPayment = async (tran_id: string, val_id: string) => {
    try {
        const order = await orderModel.findOne({ transactionId: tran_id });
        if (!order) {
            throw new AppError("Order not found", 404);
        }

        if (order.paymentStatus !== 'pending') {
            return {
                success: true,
                message: "Payment already processed",
                order
            };
        }

        const storeId = config.sslCommerze.storeId;
        const storePassword = config.sslCommerze.storePassword;
        const isLive = config.sslCommerze.isLive;

        const sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);
        const validationResponse = await sslcz.validate({ val_id });

        if (validationResponse.status !== 'VALID') {
            order.paymentStatus = 'failed';
            await order.save();

            throw new AppError("Payment validation failed", 400);
        }

        
        order.paymentStatus = 'paid';
        order.status = 'confirmed'; 
        order.paymentDetails = validationResponse;
        await order.save();

        return {
            success: true,
            message: "Payment validated successfully",
            order
        };
    } catch (error) {
        throw error;
    }
};


export const createOrderAndInitiatePayment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { items, paymentMethod, deliveryAddress } = req.body;

        console.log("Request Body:", req.body);
        const user = req.user?.id;

        JSON.parse(items);
        JSON.parse(deliveryAddress);


        if (!items || JSON.parse(items).length === 0) {
            throw new AppError("Order must contain at least one item", 400);
        }

        const medicineIds = JSON.parse(items).map((item: { medicine: string }) => item.medicine);
        const medicines = await medicineModel.find({ _id: { $in: medicineIds } });

        if (medicines.length !== JSON.parse(items).length) {
            throw new AppError("One or more medicines are not found", 400);
        }

        let totalPrice = 0;
        const validatedItems = JSON.parse(items).map((item: { medicine: string; quantity: number }) => {
            const medicine = medicines.find((m: any) => m._id.toString() === item.medicine);
            if (!medicine) throw new AppError(`Medicine with ID ${item.medicine} not found`, 400);

            const itemTotal = medicine.price * item.quantity;
            totalPrice += itemTotal;

            return {
                medicine: item.medicine,
                quantity: item.quantity,
                price: medicine.price,
                itemTotal
            };
        });

        await orderModel.validate({ user, items: JSON.parse(items), totalPrice, paymentMethod, deliveryAddress: JSON.parse(deliveryAddress) })

        let prescription = null;

        console.log("Prescription:",req.file);

        if (req.file) {
            prescription = await uploadImage(req.file);
        }
    
        const orderData = {
            user,
            items: JSON.parse(JSON.stringify(validatedItems)),
            deliveryAddress: {
                ...JSON.parse(deliveryAddress),
            },
            paymentMethod,
            prescription,
            totalPrice,
        };

   
        const paymentInitiation = await initiateSSLCommerzPayment(orderData);

        res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            data: {
                paymentUrl: paymentInitiation.paymentUrl,
                transactionId: paymentInitiation.transactionId,
                orderId: paymentInitiation.orderId
            }
        });
    } catch (error) {
        next(error);
    }
};

export const validatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tran_id } = req.params;
        const { val_id } = req.query;

        if (!val_id) {
            throw new AppError("Validation ID is required", 400);
        }

        const validationResult = await validateSSLCommerzPayment(tran_id, val_id as string);

        res.status(200).json(validationResult);
    } catch (error) {
        next(error);
    }
};

export const paymentIPN: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tran_id, val_id, status, amount, store_amount } = req.body;

        console.log("IPN Request Body:", req.body);

  
        const storeId = req.body.store_id;
        const storePass = req.body.store_passwd;

        if (storeId !== config.sslCommerze.storeId || storePass !== config.sslCommerze.storePassword) {
            res.status(401).json({ error: "Unauthorized IPN request" });
            return
        }

        const order = await orderModel.findOne({ transactionId: tran_id });
        if (!order) {
            res.status(404).json({ success: false, message: "Order not found" });
            return
        }

        if (order.paymentStatus !== 'pending') {
            res.status(200).json({ success: true, message: "Order already processed" });
            return
        }

        if (status === 'VALID') {
            
            if (parseFloat(amount) !== order.totalPrice) {
                order.paymentStatus = 'failed';
                await order.save();
                res.status(400).json({ success: false, message: "Amount mismatch" });
                return;
            }

            order.paymentStatus = 'paid';
            order.paymentMethod = req.body.card_issuer;
            order.paymentDetails = req.body;
            await order.save();

            res.status(200).json({ success: true, message: "IPN processed successfully" });
            return
        } else {
            order.paymentStatus = 'failed';
            await order.save();
            res.status(200).json({ success: false, message: "Payment failed" });
            return
        }
    } catch (error) {
        next(error);
    }
};