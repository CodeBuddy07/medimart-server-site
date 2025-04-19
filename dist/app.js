"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = __importDefault(require("./app/middlewares/errorHandler"));
const user_routes_1 = __importDefault(require("./app/modules/users/user.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const medicine_routes_1 = __importDefault(require("./app/modules/medicines/medicine.routes"));
const order_routes_1 = __importDefault(require("./app/modules/orders/order.routes"));
const app = (0, express_1.default)();
//parsers
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: ['http://localhost:3000', 'https://medimart-client-site.vercel.app'], credentials: true }));
//Application Routes
app.use('/api', user_routes_1.default);
app.use('/api/medicine', medicine_routes_1.default);
app.use('/api/order', order_routes_1.default);
app.get('/', (req, res) => {
    res.send('MediMart server is running...');
});
app.use(errorHandler_1.default);
exports.default = app;
