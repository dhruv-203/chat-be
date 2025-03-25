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

export async function getUserById(id: string) {
  try {
    const user = await db.getRepository(User).findOne({ where: { id } });
    if (user) {
      const { password, ...userData } = user;
      return userData;
    } else {
      return new ApiError(404, "User not found", null);
    }
  } catch (error) {
    return new ApiError(500, "Internal Server Error", error);
  }
}
