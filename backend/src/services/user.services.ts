// Defaults
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

// Models,Types And Logger
import UserModel from "../models/userModel";
import UserAttributes from "../types/userType";
import logger from "../utills/logger";

//Other Required Imports
import { findUser, validateUser } from "../utills/userValidator";
import { Errors, UserMessage } from "../utills/constants";
import { sendEmail } from "../helper/mailServices";
import { generateToken } from "../helper/jwt";
import {
  ValidationError,
  UserExistsError,
  InvalidCredentialsError,
  VerificationEmailError,
  CustomError,
} from "../utills/custom_error";

class UserService {
  /**
   * Retrieves all users from the database.
   *
   * @async
   * @returns {Promise<UserAttributes[]>} An array containing all user attributes.
   */
  async getAllUsers(): Promise<UserAttributes[]> {
    return await UserModel.find({});
  }

  /**
   * Generates a cryptographically secure token with an expiration time.
   *
   * @returns {object} An object containing the generated token string and its expiration date.
   * @property {string} token - A cryptographically random string.
   * @property {Date} expires - The date and time when the token expires.
   */
  generateToken(): { token: string; expires: Date } {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);
    return { token, expires };
  }

  /**
   * Registers a new user with the provided credentials.
   *
   * @async
   * @param {string} username The chosen username for the new user.
   * @param {string} email The email address of the new user.
   * @param {string} password The user's chosen password (will be hashed before saving).
   * @returns {Promise<{ success: boolean; message: string; data?: UserAttributes }>}
   *  An object indicating the registration status, message, and optionally the registered user data.
   *   - `success`: A boolean indicating successful registration (true) or failure (false).
   *   - `message`: A message describing the outcome (e.g., "Registration successful" or "Validation error").
   *   - `data` (optional): An object containing the attributes of the newly registered user (if successful).
   *
   * @throws {ValidationError} When user input fails validation checks.
   * @throws {UserExistsError} When a user with the provided username or email already exists.
   */
  async registerUser(
    username: string,
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: UserAttributes;
  }> {
    if (!validateUser(username, password, email)) {
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

    return {
      success: true,
      message: UserMessage.RegisterSuccess,
      data: newUser,
    };
  }

  /**
   * Attempts to log in a user with the provided credentials.
   *
   * @async
   * @param {string} username The username of the user trying to log in.
   * @param {string} password The password of the user trying to log in (will be compared against the hashed password).
   * @returns {Promise<{ token: string; user: UserAttributes }>}
   *  An object containing the login information on success.
   *   - `token`: A string representing the generated JWT token for the user.
   *   - `user`: An object containing the user's attributes.
   * @throws {ValidationError} When user input fails validation checks.
   * @throws {InvalidCredentialsError} When the username or password is incorrect, or the user is not verified.
   */
  async loginUser(
    username: string,
    password: string
  ): Promise<{
    token: string;
    user: UserAttributes;
  }> {
    // Validate user input
    if (!validateUser(username, password)) {
      // Handling error using Graphql Error
      /** 
       throw new GraphQLError(UserMessage.Validation, {
        extensions: {
          code: 'FORBIDDEN',
        },
      }); 
      */
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

  /**
   * Handles the forgot password functionality for a user.
   *
   * @param {string} email - The email address of the user requesting a password reset.
   *
   * @returns {Promise<{ success: boolean; message: string; data?: UserAttributes }>}
   *  - A promise that resolves to an object with the following properties:
   *     - `success`: A boolean indicating whether the forgot password request was successful.
   *     - `message`: A message indicating the outcome of the request.
   *     - `data` (optional): The user object containing the updated forgot password token information (if successful).
   *
   * @throws {UserExistsError} - Thrown if a user with the provided email address is not found.
   */
  async forgotPassword(email: string): Promise<{
    success: boolean;
    message: string;
    data?: UserAttributes;
  }> {
    const user = await UserModel.findOne({ email });

    if (!user) {
      logger.info(UserMessage.NotFound);
      throw new UserExistsError(UserMessage.Exists);
    }
    const { token: forgotpasstoken, expires: tokenExpiry } =
      this.generateToken();

    user.forgotpasstoken = forgotpasstoken;
    user.forgotpasstokenexpires = tokenExpiry;

    await user.save();

    const resetLink = `${process.env.BASE_URL}user/reset/reset-password/${forgotpasstoken}`;

    sendEmail(email, UserMessage.ResetPassword, resetLink);
    logger.info(UserMessage.EmailInstructions);
    return {
      success: true,
      message: UserMessage.PasswordSuccess,
      data: user,
    };
  }

  /**
   * Resets the password for a user using a forgot password token.
   *
   * @param {string} token - The forgot password token received by the user.
   * @param {string} newPassword - The new password to be set for the user.
   *
   * @returns {Promise<{ msg: string }>}
   *  - A promise that resolves to an object with a message property.
   *     - `msg`: A string message indicating the outcome of the password reset.
   *
   * @throws {CustomError} - Thrown if the provided token is invalid, expired, or any other error occurs.
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ msg: string }> {
    const user = await UserModel.findOne({ forgotpasstoken: token });

    if (
      !user ||
      !user.forgotpasstokenexpires ||
      user.forgotpasstokenexpires.getTime() < Date.now()
    ) {
      throw new CustomError("Invalid or expired token", "TOKEN_EXPIRED");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.forgotpasstoken = undefined;
    user.forgotpasstokenexpires = undefined;

    await user.save();

    return { msg: "Password Reset Successfully..." };
  }
}

export default new UserService();
