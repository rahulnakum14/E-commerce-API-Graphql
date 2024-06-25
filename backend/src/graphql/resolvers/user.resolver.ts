// Defaults
import { ApolloError, UserInputError } from "apollo-server-errors";

// Other Configs 
import userService from "../../services/user.services";
import { CustomError } from "../../utills/custom_error";
import { verifyEmail } from "../../helper/mailServices";
import { Errors } from "../../utills/constants";
import logger from "../../utills/logger";

const userResolvers = {
  /**
   * Represents the Query type in the GraphQL schema.
   *
   * @typedef {Object} Query
   */
  Query: {
    /**
     * Verifies a user's email address using a signup token.
     *
     * @param {Object} args - Arguments for the verification.
     * @param {string} args.signupToken - The token received during user signup.
     * @returns {Promise<VerifyEmailResponse>} Response indicating success or failure of email verification.
     * @throws {ApolloError} - Thrown for errors during verification process.
     */
    verifyEmail: async (_: any, args: { signupToken: string }) => {
      try {
        return await verifyEmail(args.signupToken);
      } catch (error) {
        logger.fatal(Errors.EmailVerifyError);
        throw new ApolloError(Errors.EmailVerifyError);
      }
    },

    /**
     * Fetches all users in the system.
     *
     * @returns {Promise<User[]>} Promise that resolves to an array of User objects.
     * @throws {ApolloError} - Thrown for errors during user retrieval.
     */
    getUsers: async () => {
      try {
        return await userService.getAllUsers();
      } catch (error) {
        logger.fatal(Errors.GetAllUsers);
        throw new ApolloError(Errors.GetAllUsers);
      }
    },
  },

  /**
   * Represents the Mutation type in the GraphQL schema.
   *
   * @typedef {Object} Mutation
   */
  Mutation: {
    /**
     * Registers a new user in the system.
     *
     * @param {Object} args - Arguments for user registration.
     * @param {string} args.username - The desired username for the new user (required).
     * @param {string} args.email - The email address for the new user (required).
     * @param {string} args.password - The password for the new user (required).
     * @returns {Promise<UserResponse>} Response indicating success or failure of registration.
     * @throws {UserInputError} - Thrown for validation errors or user already exists.
     * @throws {ApolloError} - Thrown for other unexpected errors during registration.
     */
    async registerUser(
      _: any,
      args: { username: string; email: string; password: string }
    ) {
      try {
        const result = await userService.registerUser(
          args.username,
          args.email,
          args.password
        );
        if (result.success) {
          return {
            success: result.success,
            message: result.message,
            data: result.data,
          };
        } else {
          logger.fatal(Errors.signUpError);
          throw new ApolloError(Errors.signUpError);
        }
      } catch (error) {
        if (error instanceof CustomError) {
          if (
            error.code === "VALIDATION_ERROR" ||
            error.code === "USER_EXISTS"
          ) {
            throw new UserInputError(error.message);
          }
        }
        throw new ApolloError(Errors.GenericError);
      }
    },

    /**
     * Logs in a user using username and password.
     *
     * @param {Object} args - Arguments for login.
     * @param {string} args.username - The username of the user (required).
     * @param {string} args.password - The password of the user (required).
     * @returns {Promise<UserLoginData>} Response containing user information and authentication token upon successful login.
     * @throws {UserInputError} - Thrown for validation errors, email verification failure, or invalid credentials.
     * @throws {ApolloError} - Thrown for other unexpected errors during login.
     */
    async loginUser(_: any, args: { username: string; password: string }) {
      try {
        const result = await userService.loginUser(
          args.username,
          args.password
        );

        if (result) {
          return result;
        } else {
          throw new ApolloError("Login failed");
        }
      } catch (error) {
        // Handle Error Using Graphql Error If thrown by graphql error in user.service
        /** 
         if (error instanceof GraphQLError) {
            throw error; // This will preserve the original UserInputError with the custom message
          }
        **/
        if (error instanceof CustomError) {
          if (
            error.code === "VALIDATION_ERROR" ||
            error.code === "EMAIL_VERIFICATION_FAILED" ||
            error.code === "INVALID_CREDENTIALS"
          ) {
            throw new UserInputError(error.message);
          }
        }
        throw new ApolloError(Errors.GenericError);
      }
    },
  },
};

export default userResolvers;
