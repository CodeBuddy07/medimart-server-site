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
exports.paymentIPN = exports.validatePayment = exports.createOrderAndInitiatePayment = exports.validateSSLCommerzPayment = exports.initiateSSLCommerzPayment = void 0;
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const AppError_1 = require("../../utils/AppError");
const order_model_1 = __importDefault(require("../orders/order.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const medicine_model_1 = __importDefault(require("../medicines/medicine.model"));
const cloudinary_1 = require("../../utils/cloudinary");
const config_1 = __importDefault(require("../../config"));
const initiateSSLCommerzPayment = (orderData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!orderData.items || !orderData.items.length || !orderData.user || !orderData.deliveryAddress) {
            throw new AppError_1.AppError("Required fields are missing", 400);
        }
        const tempOrder = new order_model_1.default(Object.assign(Object.assign({}, orderData), { status: 'pending', paymentStatus: 'pending' }));
        yield tempOrder.validate();
        ;
        const tran_id = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const user = yield user_model_1.default.findById(orderData.user);
        if (!user) {
            throw new AppError_1.AppError("User not found", 404);
        }
        const data = {
            total_amount: orderData.totalPrice,
            currency: 'BDT',
            tran_id,
            success_url: `${config_1.default.frontendUrl}/payment/success/${tran_id}`,
            fail_url: `${config_1.default.frontendUrl}/payment/failed/${tran_id}`,
            cancel_url: `${config_1.default.frontendUrl}/payment/cancel/${tran_id}`,
            ipn_url: `${config_1.default.backendUrl}/api/order/ipn`,
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
        const storeId = config_1.default.sslCommerze.storeId;
        const storePassword = config_1.default.sslCommerze.storePassword;
        const isLive = config_1.default.sslCommerze.isLive;
        tempOrder.transactionId = tran_id;
        yield tempOrder.save();
        const sslcommerz = new sslcommerz_lts_1.default(storeId, storePassword, isLive);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiResponse = yield sslcommerz.init(data);
        console.log("API Response:", apiResponse);
        if (!apiResponse.GatewayPageURL) {
            throw new AppError_1.AppError("Failed to generate payment URL", 500);
        }
        return {
            paymentUrl: apiResponse.GatewayPageURL,
            transactionId: tran_id,
            orderId: tempOrder._id
        };
    }
    catch (error) {
        throw error;
    }
});
exports.initiateSSLCommerzPayment = initiateSSLCommerzPayment;
const validateSSLCommerzPayment = (tran_id, val_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findOne({ transactionId: tran_id });
        if (!order) {
            throw new AppError_1.AppError("Order not found", 404);
        }
        if (order.paymentStatus !== 'pending') {
            return {
                success: true,
                message: "Payment already processed",
                order
            };
        }
        const storeId = config_1.default.sslCommerze.storeId;
        const storePassword = config_1.default.sslCommerze.storePassword;
        const isLive = config_1.default.sslCommerze.isLive;
        const sslcz = new sslcommerz_lts_1.default(storeId, storePassword, isLive);
        const validationResponse = yield sslcz.validate({ val_id });
        if (validationResponse.status !== 'VALID') {
            order.paymentStatus = 'failed';
            yield order.save();
            throw new AppError_1.AppError("Payment validation failed", 400);
        }
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.paymentDetails = validationResponse;
        yield order.save();
        return {
            success: true,
            message: "Payment validated successfully",
            order
        };
    }
    catch (error) {
        throw error;
    }
});
exports.validateSSLCommerzPayment = validateSSLCommerzPayment;
const createOrderAndInitiatePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { items, paymentMethod, deliveryAddress } = req.body;
        console.log("Request Body:", req.body);
        const user = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        JSON.parse(items);
        JSON.parse(deliveryAddress);
        if (!items || JSON.parse(items).length === 0) {
            throw new AppError_1.AppError("Order must contain at least one item", 400);
        }
        const medicineIds = JSON.parse(items).map((item) => item.medicine);
        const medicines = yield medicine_model_1.default.find({ _id: { $in: medicineIds } });
        if (medicines.length !== JSON.parse(items).length) {
            throw new AppError_1.AppError("One or more medicines are not found", 400);
        }
        let totalPrice = 0;
        const validatedItems = JSON.parse(items).map((item) => {
            const medicine = medicines.find((m) => m._id.toString() === item.medicine);
            if (!medicine)
                throw new AppError_1.AppError(`Medicine with ID ${item.medicine} not found`, 400);
            const itemTotal = medicine.price * item.quantity;
            totalPrice += itemTotal;
            return {
                medicine: item.medicine,
                quantity: item.quantity,
                price: medicine.price,
                itemTotal
            };
        });
        yield order_model_1.default.validate({ user, items: JSON.parse(items), totalPrice, paymentMethod, deliveryAddress: JSON.parse(deliveryAddress) });
        let prescription = null;
        if (req.file) {
            prescription = yield (0, cloudinary_1.uploadImage)(req.file);
        }
        const orderData = {
            user,
            items: JSON.parse(JSON.stringify(validatedItems)),
            deliveryAddress: Object.assign({}, JSON.parse(deliveryAddress)),
            paymentMethod,
            prescription,
            totalPrice,
        };
        const paymentInitiation = yield (0, exports.initiateSSLCommerzPayment)(orderData);
        res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            data: {
                paymentUrl: paymentInitiation.paymentUrl,
                transactionId: paymentInitiation.transactionId,
                orderId: paymentInitiation.orderId
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createOrderAndInitiatePayment = createOrderAndInitiatePayment;
const validatePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tran_id } = req.params;
        const { val_id } = req.query;
        if (!val_id) {
            throw new AppError_1.AppError("Validation ID is required", 400);
        }
        const validationResult = yield (0, exports.validateSSLCommerzPayment)(tran_id, val_id);
        res.status(200).json(validationResult);
    }
    catch (error) {
        next(error);
    }
});
exports.validatePayment = validatePayment;
const paymentIPN = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tran_id, val_id, status, amount, store_amount } = req.body;
        console.log("IPN Request Body:", req.body);
        const storeId = req.body.store_id;
        const storePass = req.body.store_passwd;
        if (storeId !== process.env.SSLCOMMERZ_STORE_ID || storePass !== process.env.SSLCOMMERZ_STORE_PASSWORD) {
            res.status(401).json({ error: "Unauthorized IPN request" });
            return;
        }
        const order = yield order_model_1.default.findOne({ transactionId: tran_id });
        if (!order) {
            res.status(404).json({ success: false, message: "Order not found" });
            return;
        }
        if (order.paymentStatus !== 'pending') {
            res.status(200).json({ success: true, message: "Order already processed" });
            return;
        }
        if (status === 'VALID') {
            if (parseFloat(amount) !== order.totalPrice) {
                order.paymentStatus = 'failed';
                yield order.save();
                res.status(400).json({ success: false, message: "Amount mismatch" });
                return;
            }
            order.paymentStatus = 'paid';
            order.status = 'confirmed';
            order.paymentDetails = req.body;
            yield order.save();
            res.status(200).json({ success: true, message: "IPN processed successfully" });
            return;
        }
        else {
            order.paymentStatus = 'failed';
            yield order.save();
            res.status(200).json({ success: false, message: "Payment failed" });
            return;
        }
    }
    catch (error) {
        next(error);
    }
});
exports.paymentIPN = paymentIPN;
