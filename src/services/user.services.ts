// Defaults
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

// Models,Types And Logger
import UserModel from "../models/userModel";
import UserAttributes from "../types/userType";
import logger from "../utills/logger";

//Other Required Imports
import { findUser, validateUser } from "../utills/userValidator";
import { UserMessage } from "../utills/constants";
import { sendEmail } from "../helper/mailServices";
import { generateToken } from "../helper/jwt";
import {
  ValidationError,
  UserExistsError,
  InvalidCredentialsError,
  VerificationEmailError,
} from "../utills/custom_error";
import { GraphQLError } from "graphql";

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
  generateToken(): { token: String; expires: Date } {
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
      Logger.error(
        "User Validation error (Register user)- user services",
        UserMessage.Validation
      );
      throw new ValidationError(UserMessage.Validation);
    }

    const isExists = await findUser(username, email);

    if (isExists) {
      Logger.warn(
        "User Already Exist (Register user) - user services",
        UserMessage.Exists
      );
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

    Logger.info(
      "User Successfully Registered - in services",
      UserMessage.RegisterSuccess
    );

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
      Logger.error(
        "User Validation error (Login user)- user services",
        UserMessage.Validation
      );

      throw new ValidationError(UserMessage.Validation);
    }

    // Check if the user exists
    const user = await UserModel.findOne({ username });

    if (!user) {
      Logger.warn(
        "Invalid User Credentials (Login user)- user services",
        UserMessage.InvalidCredentials
      );
      throw new InvalidCredentialsError(UserMessage.InvalidCredentials);
    }

    // Check if the user is verified
    if (!user.isVerified) {
      Logger.warn("(Login user)- user services", UserMessage.VerifyEmailFailed);
      throw new VerificationEmailError(UserMessage.VerifyEmailFailed);
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      Logger.warn(
        "Invalid User Credentials isMatch (Login user)- user services",
        UserMessage.InvalidCredentials
      );

      logger.warn(UserMessage.InvalidCredentials);
      throw new InvalidCredentialsError(UserMessage.InvalidCredentials);
    }

    // Generate token
    const token = generateToken(user);

    Logger.info(
      "User Successfully Logged in - in services",
      UserMessage.LoginSuccess
    );

    return {
      token: token as string,
      user: user,
    };
  }
}

export default new UserService();
