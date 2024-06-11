// Defaults
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import path from "path";
import bcrypt from "bcrypt";

// User Models
import UserModel from "../models/userModel";

// Response Types
import { sendErrorResponse, successResponse } from "../utills/responseHandler";

// User Types
import UserAttributes from "../types/userType";

/* Helper Function To Find The user. */
const findUserByToken = async (
  token: string,
  tokenField: string
): Promise<UserAttributes | null> => {
  const query: { [key: string]: string } = {};
  query[tokenField] = token;
  return UserModel.findOne(query);
};

/**
 * Sends an verification email.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} html - The HTML content of the email.
 * @throws Will throw an error if the email cannot be sent.
 */
const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachmentPath?: string
) => {
  try {
    console.log('test 2 ********************', process.env.EMAIL_USERNAME);
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject,
      html,
    };

    if (attachmentPath) {
      mailOptions.attachments = [
        {
          filename: path.basename(attachmentPath),
          path: attachmentPath,
        },
      ];
    }
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Change the Password.
 *
 * @param {Request} req -  The Request Object
 * @param {string} req.params.token - Verification Token of the user for signup.
 * @param {Response} res - A JSON response indicating success or failure based on validation.
 * @return {*}  {Promise<Response>}
 */
const verifyEmail = async (signupToken: string) => {
  try {
    const user = await findUserByToken(signupToken, "signuptoken");
    if (!user) {
      return {
        success: false,
        message: "Invalid Token",
      };
    }

    user.isVerified = true;
    user.signuptoken = undefined;
    user.signuptokenexpires = undefined;

    await user.save();

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error occurred during verification of email",
    };
  }
};
/**
 * Change the Password.
 *
 * @param {Request} req -  The Request Object
 * @param {string} req.params - Password reset token of the user.
 * @param {string} req.body.password - New Password of the user.
 * @param {Response} res - A JSON response indicating success or failure based on validation.
 * @return {*}  {Promise<Response>}
 */
const forgotPassget = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await findUserByToken(token, "forgotpasstoken");

    if (!user) {
      sendErrorResponse(res, 400, "Invalid or expired token");
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    user.forgotpasstoken = undefined;
    user.forgotpasstokenexpires = undefined;

    await user.save();

    return successResponse(res, 200, "Password Reset SuccessFully...");
  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, 400, "Internal Server Error");
  }
};

export { sendEmail, verifyEmail, forgotPassget };
