import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/ApiError";
import { db } from "../config/db";
import { Gender, User } from "../entities/user";

export const createNewUser = async (
  name: string,
  email: string,
  password: string,
  gender: Gender
) => {
  const user = new User();
  user.name = name;
  user.email = email;
  user.password = bcrypt.hashSync(password, 10);
  user.gender = gender;
  user.profilePicture = `https://avatar.iran.liara.run/public/${
    gender === "MALE" ? "boy" : "girl"
  }?username=${user.email}`;
  try {
    const accessToken = await user.generateAccessToken();
    const { password, ...savedUser } = await user.save();
    return { accessToken, savedUser };
  } catch (err: any) {
    return new ApiError(500, err.message, err);
  }
};

export const isDuplicateUser = async (email: string) => {
  const user = await db.getRepository(User).findOne({ where: { email } });
  if (user) {
    return new ApiError(403, "Bad Request User Already Exists", null);
  }
  return false;
};

export const loginUser = async (email: string, password: string) => {
  const user = await db.getRepository(User).findOne({ where: { email } });
  if (!user) {
    return new ApiError(401, "Bad Request User Doesn't Exist", null);
  }
  if (!(await user.checkPassword(password))) {
    return new ApiError(401, "Bad Request Password Incorrect", null);
  }
  const accessToken = await user.generateAccessToken();
  return { accessToken, user };
};

export const getUserById = async (id: number) => {
  const user = await db.getRepository(User).findOne({ where: { id } });
  if (!user) {
    return new ApiError(404, "User not found on this id", []);
  }
  return user;
};
