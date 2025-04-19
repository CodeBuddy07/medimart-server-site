import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL as string, 
  jwt: {
    secret: process.env.JWT_SECRET as string, 
    refreshSecret: process.env.JWT_REFRESH_SECRET as string, 
  },
  email: {
    user: process.env.EMAIL_USER as string, 
    pass: process.env.EMAIL_PASS as string, 
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string, 
    apiKey: process.env.CLOUDINARY_API_KEY as string, 
    apiSecret: process.env.CLOUDINARY_API_SECRET as string, 
  },
  sslCommerze: {
    storeId: process.env.STORE_ID as string,
    storePassword: process.env.STORE_PASSWD as string,
    isLive: process.env.IS_LIVE === "true",
  },
  environment: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
};
