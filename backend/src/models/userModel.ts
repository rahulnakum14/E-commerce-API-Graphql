import mongoose, { Schema } from "mongoose";
import UserAttributes from "../types/userType";

/**
 * @typedef {Object} UserAttributes - Defines the attributes of a user.
 *
 * @property {string}  username - The name of the product. (Required)
 * @property {string}  email - The price of the product. (Required)
 * @property {string}  password - The password of the user. (Required)
 * @property {Boolean} isVerified - User Is verified or not (default - false). (Required)
 * @property {string}  role - The Role of the user (default - customer). (Required)
 * @property {string}  salt - Randome Bytes to Stores the encrypt password.
 * @property {string}  signuptoken - The signuptoken for verification.
 * @property {string}  forgotpasstoken - The forgotpasstoken for reseting the password.
 */
const userSchema: Schema<UserAttributes> = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "customer",
    },
    signuptoken: {
      type: String,
    },
    signuptokenexpires: {
      type: Date,
    },
    forgotpasstoken: {
      type: String,
    },
    forgotpasstokenexpires:{
      type: Date,
    }
  },
  {
    timestamps: true,
    collection: "userModel",
  }
);

const UserModel = mongoose.model<UserAttributes>("userModel", userSchema);

export default UserModel;
