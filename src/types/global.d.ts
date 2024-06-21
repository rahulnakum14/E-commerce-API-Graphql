// User Types
import UserAttributes from "./userType";
import { Logger } from "../utills/logger";

declare global {
  var Logger: Logger;

  namespace Express {
    /**
     * @namespace Express
     * @interface Request
     * @property {UserAttributes} [user] - Represents the user associated with the request.
     */

    interface Request {
      user?: UserAttributes;
    }
    /**
     * Augments the Express.Response interface to include additional properties.
     * @namespace Express
     * @interface Response
     * @property {UserAttributes} [user] - Represents user-related data in the response.
     */
    interface Response {
      user?: UserAttributes;
    }
  }
}

export { };
