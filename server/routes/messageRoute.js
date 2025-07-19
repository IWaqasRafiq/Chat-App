import express from "express"
import { protectRoute } from "../middleware/auth.js";
import { getMessage, getUserForSidebar, markMessageAsSeen, sendMessage } from "../controlers/messageController.js";





const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUserForSidebar);
messageRouter.get("/:id", protectRoute, getMessage);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;