import express from "express"
import { proctectRoute } from "../middleware/auth.js";
import { getMessage, getUserForSidebar, markMessageAsSeen, sendMessage } from "../controlers/messageController.js";





const messageRouter = express.Router();

messageRouter.get("/users", proctectRoute, getUserForSidebar);
messageRouter.get("/:id", proctectRoute, getMessage);
messageRouter.put("/mark/:id", proctectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", proctectRoute, sendMessage);

export default messageRouter;