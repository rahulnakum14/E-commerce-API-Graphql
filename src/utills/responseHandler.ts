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
  return res.status(statusCode).json({ error: errorMessage });
}
