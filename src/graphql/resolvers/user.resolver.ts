// src/graphql/resolvers/user.resolvers.ts

import userService from "../../services/user.services";
import { ApolloError, UserInputError } from "apollo-server-errors";
import { CustomError } from "../../utills/custom_error";
import { verifyEmail } from "../../helper/mailServices";
import { Errors } from "../../utills/constants";
import logger from "../../utills/logger";

const userResolvers = {
  Query: {
    verifyEmail: async (_: any, args: { signupToken: string }) => {
      try {
        return await verifyEmail(args.signupToken);
      } catch (error) {
        logger.fatal(Errors.EmailVerifyError);
        throw new ApolloError(Errors.EmailVerifyError);
      }
    },
    getUsers: async () => {
      try {
        return await userService.getAllUsers();
      } catch (error) {
        logger.fatal(Errors.GetAllUsers);
        throw new ApolloError(Errors.GetAllUsers);
      }
    },
  },

  Mutation: {
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
        if (error instanceof CustomError) {
          if (
            error.code === "VALIDATION_ERROR" ||
            error.code === "EMAIL_VERIFICATION_FAILED" ||
            error.code === "INVALID_CREDENTIALS"
          ) {
            console.log('abotu to throwing a new errrr',error.message);
            
            throw new UserInputError(error.message);
            
          }
        }
        throw new ApolloError(Errors.GenericError);
      }
    },
  },
};

export default userResolvers;
