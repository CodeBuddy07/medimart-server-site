import express from 'express';
import verifyUser from '../../middlewares/verifyUser';
import { verifyAdmin } from '../../middlewares/verifyAdmin';
import { getStatistics } from './statistics.controller';


const statisticsRouter = express.Router();

statisticsRouter.get('/', verifyUser, verifyAdmin, getStatistics);

export default statisticsRouter;