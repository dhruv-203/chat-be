import "reflect-metadata";
import { DataSource } from "typeorm";
import { Message } from "../entities/message";
import { User } from "../entities/user";

export const db = new DataSource({
  type: "postgres",
  synchronize: true,
  logging: ["error"],
  url: process.env.DATABASE_URL,
  entities: [User, Message],
});
