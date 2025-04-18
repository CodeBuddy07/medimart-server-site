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
exports.comparePassword = exports.hashPassword = exports.verifyRefreshToken = exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../config"));
// Generate Access Token
const generateToken = (payload, expiresIn = "1h") => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.secret, { expiresIn });
};
exports.generateToken = generateToken;
// Generate Refresh Token
const generateRefreshToken = (payload, expiresIn = "7d") => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.refreshSecret, { expiresIn });
};
exports.generateRefreshToken = generateRefreshToken;
// Verify Token
const verifyToken = (token) => jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
exports.verifyToken = verifyToken;
// Verify Refresh Token
const verifyRefreshToken = (token) => jsonwebtoken_1.default.verify(token, config_1.default.jwt.refreshSecret);
exports.verifyRefreshToken = verifyRefreshToken;
// Hash Password
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
});
exports.hashPassword = hashPassword;
// Compare Password
const comparePassword = (password, hash) => __awaiter(void 0, void 0, void 0, function* () {
    return bcryptjs_1.default.compare(password, hash);
});
exports.comparePassword = comparePassword;
