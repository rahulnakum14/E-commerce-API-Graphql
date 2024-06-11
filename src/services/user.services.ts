// src/services/user.service.ts

import UserModel from "../models/userModel";
import UserAttributes from "../types/userType";
import { UserMessage } from "../utills/constants";
import logger from "../utills/logger";
import { findUser, validateUser } from "../utills/userValidator";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { sendEmail } from "../helper/mailServices";
import { generateToken } from "../helper/jwt";
import {
  ValidationError,
  UserExistsError,
  InvalidCredentialsError,
  VerificationEmailError,
} from "../utills/custom_error";

class UserService {
  async getAllUsers(): Promise<UserAttributes[]> {
    return await UserModel.find({});
  }

  generateToken(): { token: String; expires: Date } {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);
    return { token, expires };
  }

  async registerUser(
    username: string,
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: UserAttributes;
  }> {
    if (!validateUser(username, email, password)) {
      throw new ValidationError(UserMessage.Validation);
    }

    const isExists = await findUser(username, email);

    if (isExists) {
      logger.warn(UserMessage.Exists);
      throw new UserExistsError(UserMessage.Exists);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { token: signuptoken, expires: tokenExpiry } = this.generateToken();

    const newUser = new UserModel({
      username: username,
      email: email,
      password: hashedPassword,
      signuptoken: signuptoken,
      signuptokenexpires: tokenExpiry,
    });

    await newUser.save();

    const verificationLink = `${process.env.BASE_URL}user/verifyEmail/${signuptoken}`;

    sendEmail(newUser.email, UserMessage.VerifyEmail, verificationLink);

    logger.info(UserMessage.RegisterSuccess);

    console.log("this is new user", newUser);

    return {
      success: true,
      message: UserMessage.RegisterSuccess,
      data: newUser,
    };
  }

  async loginUser(
    username: string,
    password: string
  ): Promise<{
    token: string;
    user: UserAttributes;
  }> {
    // Validate user input
    if (!validateUser(username, password)) {
      throw new ValidationError(UserMessage.Validation);
    }

    // Check if the user exists
    const user = await UserModel.findOne({ username });
    if (!user) {
      logger.warn(UserMessage.InvalidCredentials);
      throw new InvalidCredentialsError(UserMessage.InvalidCredentials);
    }

    // Check if the user is verified
    if (!user.isVerified) {
      logger.warn(UserMessage.VerifyEmailFailed);
      throw new VerificationEmailError(UserMessage.VerifyEmailFailed);
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(UserMessage.InvalidCredentials);
      throw new InvalidCredentialsError(UserMessage.InvalidCredentials);
    }

    // Generate token
    const token = generateToken(user);

    logger.info(UserMessage.LoginSuccess);

    return {
      token: token as string,
      user: user,
    };
  }
}

export default new UserService();
