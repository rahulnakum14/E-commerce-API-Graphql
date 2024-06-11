// Defaults
import { Request, Response, NextFunction } from "express";

// JWT Token Validator
import { validateToken } from "../helper/jwt";

// Response Types
import { sendErrorResponse, successResponse } from "../utills/responseHandler";

// UserAttributes
import UserAttributes from "../types/userType";

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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> { 
    try {
      const token: string | undefined = req.headers["authorization"];
  
      if (!token) {
        return sendErrorResponse(res, 403, "Unauthorized or Token does not exist");
      }
  
      const tokenSplit = token.split(" ")[1];
  
      if (!tokenSplit) {
        return sendErrorResponse(res, 403, "Invalid token format");
      }
  
      const result = validateToken(tokenSplit);
  
      if (result) {
        req.user = result as UserAttributes;
        next();
      } else {
        return sendErrorResponse(res, 403, "Invalid token");
      }
    } catch (error) {
      return sendErrorResponse(res, 400, "Invalid token");
    }
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
        return successResponse(res, 403, "Not Authorized to access");
      }
      if (role.includes(req.user.role)) {
        return res.status(403).json({ Error: "Unauthorized to access" });
      }
      next();
    };
  }
}

export default new AuthMiddleware();
