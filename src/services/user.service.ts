import { ApiError } from "../../utils/ApiError";
import { db } from "../config/db";
import { User } from "../entities/user";

export async function getAllUsers() {
  try {
    const users = (await db.getRepository(User).find()).map((val) => {
      const { password, ...user } = val;
      return user;
    });

    return users;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", error);
  }
}
