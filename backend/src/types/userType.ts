// Mongooese Document

import { Document } from "mongoose";

/**
 * Interface representing attributes of a user.
 * @interface UserAttributes
 * @property {number} id - The unique identifier of the user.
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user.
 * @property {string} password - The hashed password of the user.
 * @property {string} role - The role of the user (customer or admin).
 * @property {string} signuptoken - The signuptoken of the user.
 * @property {string} forgotpasstoken - The forgotpasstoken of the user.
 */
interface UserAttributes extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  isVerified: Boolean;
  role: string;
  signuptoken?: string;
  signuptokenexpires?: Date;
  forgotpasstoken?: string;
  forgotpasstokenexpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  __v: number;
}

export default UserAttributes;
