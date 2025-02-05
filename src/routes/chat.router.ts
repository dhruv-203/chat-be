import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
// import {Server} from "socket.io";
const chatRouter = Router();

chatRouter.post("/sendMessage", ChatController.sendMessage);
chatRouter.post("/getAllMessages", ChatController.getAllMessages);

export { chatRouter };
