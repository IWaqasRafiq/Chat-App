import express from 'express';
import { checkAuth, login, signup, updateProfile } from '../controlers/userControler.js';
import { proctectRoute } from '../middleware/auth.js';


const userRouter = express.Router()

userRouter.post("/sigup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", proctectRoute, updateProfile);
userRouter.get("/check", proctectRoute, checkAuth);

export default userRouter;