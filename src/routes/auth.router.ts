import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuthController } from "../controllers/auth.controller";
import { verifyUser } from "../middlware/auth.middleware";
const authRouter = Router();

authRouter.get(
  "/checkUser",
  verifyUser,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, "Unauthorized", []));
      }
      return res.json(new ApiResponse(200, req.user));
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error", [error]));
    }
  }
);

//register
authRouter.post(
  "/register",
  body("name", "Please enter name greater 3 characters").isLength({ min: 3 }),
  body("email", "Enter email properly").isEmail(),
  body("password", "Password must be greater than 6 characters").isLength({
    min: 6,
  }),
  body("gender", "Select appropriate gender").isIn(["MALE", "FEMALE"]),
  AuthController.register
);

//login
authRouter.post(
  "/login",
  body("email", "Enter email properly").isEmail(),
  body("password", "Password must be greater than 6 characters").isLength({
    min: 6,
  }),
  AuthController.login
);

authRouter.post("/logout", verifyUser, AuthController.logout);

export default authRouter;
