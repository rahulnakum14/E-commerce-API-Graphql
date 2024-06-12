// Defaults
import { Request, Response, NextFunction } from "express";

// JWT Token Validator
import { validateToken } from "../helper/jwt";

// Response Types
import { sendErrorResponse, successResponse } from "../utills/responseHandler";

// UserAttributes
import UserAttributes from "../types/userType";

import { ApolloError } from "apollo-server-errors";
import { Errors } from "../utills/constants";

/**
 * Middleware to authenticate the provided token in the request headers.
 *
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction to pass control to the next middleware.
 * @returns {Promise<void>}
 * @throws {Error} If there's an issue validating the token or if the token is invalid.
 */
class AuthMiddleware {
async authenticateToken(req: Request): Promise< {user:UserAttributes}  | { error: string } | Response>
{
  const token: string | undefined = req.headers["authorization"];
  if (!token) {
    return { error: `${Errors.TokenNotExist}` };
  }

  const tokenSplit = token.split(" ")[1];
  if (!tokenSplit) {
    return { error: `${Errors.TokenFormat}` };
  }

  const user = validateToken(tokenSplit);
  if (!user) {
    return { error: `${Errors.InvalidToken}` };
  }

  return {user:user as UserAttributes};
}


  /**
   * Middleware to restrict access based on user role.
   *
   * @param {string} role - The role to restrict access to.
   * @returns {Function} Middleware function to handle the role-based access control.
   */
  restrictTo(role: string) {
    return function (req: Request, res: Response, next: NextFunction) {
      if (!req.user) {
        return res.status(403).json({ Error: "Not Authorized to access" });
      }
      if (role === "customer" && req.user.role === "customer") {
        next(); 
      } else if (role === "admin" && req.user.role === "admin") {
        next(); 
      } else {
        return res.status(403).json({ Error: "Unauthorized to access" }); 
      }
    };
  }
}

export default new AuthMiddleware();
