// Defaults
import { Request, Response } from "express";

// JWT Token Validator
import { validateToken } from "../helper/jwt";

// UserAttributes
import UserAttributes from "../types/userType";

// Constants
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
  async authenticateToken(
    req: Request
  ): Promise<{ user: UserAttributes } | { error: string } | Response> {
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
      return { error: `${Errors.InvalidToken}` }
    }

    return { user: user as UserAttributes };
  }
}

export default new AuthMiddleware();
