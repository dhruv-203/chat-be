import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Server } from "socket.io";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { verifyUser } from "./middlware/auth.middleware";
import { ErrorHandler } from "./middlware/errorHandler.middleware";
import authRouter from "./routes/auth.router";
import { chatRouter } from "./routes/chat.router";
import { getConnectedUsers } from "./services/io.service";
import { getAllUsers } from "./services/user.service";
const app = express();
const server = http.createServer(app);
app.use(cookieParser());
app.use(express.json());
export const ConnectedUsers: { [key: string]: string } = {};
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

console.log("Frontend Url: ", process.env.FRONTEND_URL);

app.use("/auth", authRouter);

app.get(
  "/getAllUsers",
  verifyUser,
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized Access", []));
    }
    const users = await getAllUsers();
    if (users instanceof ApiError) {
      return next(users);
    }
    return res.status(200).json(new ApiResponse(200, users));
  }
);

app.use("/chat", verifyUser, chatRouter);

io.use(async (socket, next) => {
  const cookies = socket.handshake.headers.cookie
    ?.split(";")
    .reduce((acc, val) => {
      acc[val.split("=")[0].trim()] = val.split("=")[1].trim();
      return acc;
    }, {});
  if (!cookies || !cookies["AccessToken"]) {
    return next(new ApiError(401, "Unauthorized", []));
  }
  try {
    const { id: userId } = jwt.verify(
      cookies["AccessToken"],
      process.env.SECRET_KEY
    ) as JwtPayload;
    if (userId) {
      ConnectedUsers[userId] = socket.id;
      socket.handshake.query.userId = userId as string;
      next();
    } else {
      return next(new ApiError(500, "Unable to decode access token", []));
    }
  } catch (error) {
    console.log("Error in verifyUser middleware: ", error);
    return next(
      new ApiError(401, "Unauthorised access: invalid access token", [error])
    );
  }
});

io.on("connection", async (socket) => {
  let connectedUsers = await getConnectedUsers(ConnectedUsers);
  io.emit("userConnected", connectedUsers);
  socket.on("disconnect", async () => {
    Object.entries(ConnectedUsers).forEach(([key, value]) => {
      if (value === socket.id) {
        delete ConnectedUsers[key];
      }
    });
    connectedUsers = await getConnectedUsers(ConnectedUsers);
    io.emit("userConnected", connectedUsers);
  });
});

app.use(
  ErrorHandler as (
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => Response | void
);

export { app, io, server };
