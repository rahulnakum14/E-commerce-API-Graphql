// JWT
import jwt, { JwtPayload } from "jsonwebtoken";

// UserTypes
import UserAttributes from "../types/userType";

const secretKey: string = process.env.secret_key || "jwtsecretkey";
type Token = string;

/**
 * Generates a JWT token for the given user.
 * @param {User} user The user object for which to generate the token.
 * @returns {Token | false} Returns the generated JWT token , or false if an error occurs.
 */
const generateToken = (user: UserAttributes): Token | false => {
  try {
    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, secretKey, { expiresIn: "24h" }) as Token;
  } catch (error) {
    console.error("Error generating token:", error);
    return false;
  }
};

/**
 * Validates a JWT token.
 * @param {Token} token The JWT token to validate.
 * @returns {JwtPayload | false} Returns the decoded payload of the token if validation , or false if an error occurs.
 */
const validateToken = (token: Token): JwtPayload | false => {
  try {
    console.log('Token', token);
    return jwt.verify(token, secretKey) as JwtPayload;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

export { generateToken, validateToken };
