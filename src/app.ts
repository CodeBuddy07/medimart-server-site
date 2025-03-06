import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import errorHandler from './app/middlewares/errorHandler';
import userRoutes from './app/modules/users/user.routes';
import cookieParser from "cookie-parser";
import medicineRouter from './app/modules/medicines/medicine.routes';
import orderRouter from './app/modules/orders/order.routes';


const app: Application = express();

//parsers
app.use(cookieParser()); // 🟢 Enables reading & writing cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Handles form-urlencoded
app.use(cors({ origin: ['http://localhost:5173'] }));



//Application Routes
app.use('/api', userRoutes);
app.use('/api/medicine', medicineRouter);
app.use('/api/order', orderRouter);


app.get('/', (req: Request, res: Response) => {
  res.send('MediMart server is running...');
});

app.use(errorHandler);

export default app;
