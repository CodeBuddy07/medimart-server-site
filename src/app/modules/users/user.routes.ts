import express from "express";
import { GetAllUsers, login, logout, refreshToken, register, Update } from "./auth.controllers";
import upload from "../../utils/multer";
import { verifyAdmin } from "../../middlewares/verifyAdmin";
import verifyUser from "../../middlewares/verifyUser";


const userRoutes = express.Router();

// **🔹 Public Auth Routes**
userRoutes.post("/login", login);
userRoutes.post("/refresh", refreshToken);
userRoutes.post("/logout", logout);
userRoutes.post("/register", upload.single("Image"), register);
userRoutes.post("/update/:id", verifyUser, verifyAdmin, Update);
userRoutes.post("/users", verifyUser, verifyAdmin, GetAllUsers);



export default userRoutes;
