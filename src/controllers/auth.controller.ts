import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { cookieOptions } from "../../utils/CookieOptions";
import { io } from "../app";
import {
  createNewUser,
  isDuplicateUser,
  loginUser,
} from "../services/auth.service";
export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, "Validation Error", errors.array()));
    }

    const { name, email, password, gender } = req.body;

    const check = await isDuplicateUser(email);
    //checked that user doesn't exist
    if (check instanceof ApiError) {
      return next(check);
    }

    const data = await createNewUser(name, email, password, gender);
    if (data instanceof ApiError) {
      return next(data);
    }
    io.emit("new user registered");
    res
      .cookie("AccessToken", data.accessToken, {
        ...cookieOptions,
        maxAge: 24 * (60 * 60) * 1000, //24hrs
      })
      .json(new ApiResponse(200, data.savedUser));
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, "Validation Error", errors.array()));
    }

    const { email, password } = req.body;

    const data = await loginUser(email, password);
    if (data instanceof ApiError) {
      return next(data);
    }

    res
      .cookie("AccessToken", data.accessToken, {
        ...cookieOptions,
        maxAge: 24 * (60 * 60) * 1000, //24hrs
      })
      .json(new ApiResponse(200, data));
  }
  static async logout(req: Request, res: Response) {
    res
      .clearCookie("AccessToken", {
        ...cookieOptions,
        maxAge: 0,
      })
      .json(new ApiResponse(200, { message: "Logged Out" }));
  }
}
