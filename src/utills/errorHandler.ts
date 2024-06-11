// Default
import { Response } from "express";

// Response Type
import { sendErrorResponse } from "./responseHandler";

// Logger
import logger from "./logger";

// Define a type for different operations
type Operation =
  | "Create"
  | "Update"
  | "Delete"
  | "Get"
  | "login"
  | "forgotpass"
  | "createPaymentLink"
  | "orderSuccess"
  | "cart";
type Entity = "Product" | "User";

// Error handler
export const handleError = (
  res: Response,
  operation: Operation,
  entity: Entity,
  error: any
): Response => {
  console.error(error);
  const errorMessage = `Internal Server Error ${operation} ${entity} ${error}`;
  logger.fatal(errorMessage);
  return sendErrorResponse(res, 500, errorMessage);
};
