import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config";





// Generate Access Token
export const generateToken = (payload: object, expiresIn: SignOptions["expiresIn"] = "1h") => {
  return jwt.sign(payload,  config.jwt.secret, { expiresIn });
};

// Generate Refresh Token
export const generateRefreshToken = (payload: object, expiresIn: SignOptions["expiresIn"] = "7d") => {
  return jwt.sign(payload,  config.jwt.refreshSecret, { expiresIn });
};


// Verify Token
export const verifyToken = (token: string) => jwt.verify(token,  config.jwt.secret);

// Verify Refresh Token
export const verifyRefreshToken = (token: string) => jwt.verify(token,  config.jwt.refreshSecret);

// Hash Password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare Password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
