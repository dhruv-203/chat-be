// import { Message } from "../entities/message";

import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { getAllMessages, saveMessage } from "../services/chat.service";
export class ChatController {
  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    //send message to the reciever
    //save message to db
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized Access to chat", null));
    }
    const { receiverId, message } = req.body;
    if (!message) {
      return next(new ApiError(400, "Message is required", null));
    }
    if (!receiverId) {
      return next(new ApiError(400, "Receiver id is required", null));
    }
    const check = await saveMessage(message, receiverId, req.user.id);
    if (check instanceof ApiError) {
      return next(check);
    }

    return res.status(200).json(
      new ApiResponse(200, {
        success: true,
        message: "Message sent successfully",
        data: check,
      })
    );
  }

  static async getAllMessages(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized Access to chat", null));
    }
    const { receiverId } = req.body;
    if (!receiverId) {
      return next(new ApiError(400, "Receiver id is required", null));
    }
    const check = await getAllMessages(receiverId, req.user.id);
    if (check instanceof ApiError) {
      return next(check);
    }
    return res.status(200).json(new ApiResponse(200, check));
  }
}
