// User Types
import UserAttributes from "./userType";

declare global {
  namespace Express {
    /**
     * @namespace Express
     * @interface Request
     * @property {UserAttributes} [user] - Represents the user associated with the request.
     */

    export interface Request {
      user?: UserAttributes;
    }
    /**
     * Augments the Express.Response interface to include additional properties.
     * @namespace Express
     * @interface Response
     * @property {UserAttributes} [user] - Represents user-related data in the response.
     */
    export interface Response {
      user?: UserAttributes;
    }
  }
}
