// Dafaults
import { Response } from "express";

/** Different Types of Responses. */
export function successResponse<T>(
  res: Response,
  statusCode: number,
  msg: string | number,
  data?: T
) {
  return res.status(statusCode).json({ msg: msg, data: data });
}


export function sendErrorResponse(
  res?: Response,
  statusCode?: number,
  errorMessage?: string
) {
  if (!res) {
    Logger.error('Response object is undefined');
    throw new Error('Response object is undefined');
  }

  // Ensure statusCode is defined or provide a default value (e.g., 500 for Internal Server Error)
  const status = statusCode || 500;

  return res.status(status).json({ error: errorMessage });
}