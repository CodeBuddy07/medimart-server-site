import express from "express";
import { GetAllUsers, GetMe, login, refreshToken, register, Update } from "./auth.controllers";
import upload from "../../utils/multer";
import { verifyAdmin } from "../../middlewares/verifyAdmin";
import verifyUser from "../../middlewares/verifyUser";


const userRoutes = express.Router();


userRoutes.post("/login", login);
userRoutes.post("/refresh", refreshToken);
userRoutes.post("/register", upload.single("Image"), register);
userRoutes.post("/update/:id", verifyUser, verifyAdmin, Update);
userRoutes.get("/me", verifyUser, GetMe);
userRoutes.get("/", verifyUser, verifyAdmin, GetAllUsers);



export default userRoutes;
