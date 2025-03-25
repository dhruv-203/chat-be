import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

interface JwtPayload {
  id: number;
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  profilePicture: string;

  @Column()
  name: string;

  @Column({ type: "enum", enum: Gender })
  gender: Gender;

  @Column()
  email: string;

  @Column()
  password: string;

  async checkPassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }

  async generateAccessToken() {
    return jwt.sign(
      {
        id: this.id,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      } as jwt.SignOptions
    );
  }
}
