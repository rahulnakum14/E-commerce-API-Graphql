// UserModel
import UserModel from "../models/userModel";

// UserType
import UserAttributes from "../types/userType";
import { Errors, UserMessage } from "./constants";

// Logger
import logger from "./logger";

/**
 * Validates user input for username, email, and password.
 * @param {string} username - The username to validate.
 * @param {string} email - The email to validate.
 * @param {string} password - The password to validate.
 * @returns {boolean} Returns true if all inputs are provided, otherwise returns false.
 */
const validateUser = (
  username: string,
  password: string,
  email?: string
): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!username || !password) {
    logger.error(UserMessage.Validation);
    return false;
  }
  if (email !== undefined && (!email || !emailRegex.test(email))) {
    logger.error(Errors.EmailError);
    return false;
  }
  return true;
};

/**
 * Finds a user in the database by their username or email.
 * @param {string} username - The username of the user to find.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<UserAttributes | null>} A Promise that resolves with the found user or null if not found.
 */
const findUser = async (
  username: string,
  email: string
): Promise<UserAttributes | null> => {
  try {
    const user = await UserModel.findOne({
      $or: [{ email: email }, { username: username }],
    });
    return user;
  } catch (error) {
    console.error("Error occurred while finding user:", error);
    return null;
  }
};

export { validateUser, findUser };
