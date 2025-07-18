import jwt from "jsonwebtoken"
import User from "../models/user.js"



export const proctectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;

        next();
        
    } catch (error) {
     res.status(404).json({success: false, message: error.message });

    }
}

