// Defaults
import { GraphQLResolveInfo } from "graphql";
import { UserInputError } from "apollo-server-errors";

// Other Configs
import paymentServices from "../../services/payment.services";
import { CustomError } from "../../utills/custom_error";
import { PaymentMessage } from "../../utills/constants";


const paymentResolvers = {
  /**
   * Represents the Query type in the GraphQL schema.
   *
   * @typedef {Object} Query
   */
  Query: {
    /**
     * Fetches a payment URL for a user's cart (requires authentication).
     *
     * @param {Object} parent - Parent object in the GraphQL resolution chain (often unused).
     * @param {Object} args - Arguments for getting the payment URL.
     * @param {string} args.userID - The ID of the user (from context).
     * @param {Object} context - Context object containing authentication and other data.
     * @param {GraphQLResolveInfo} info - Information about the current GraphQL resolution.
     * @returns {Promise<string>} Promise that resolves to a payment URL string.
     * @throws {UserInputError} - Thrown for specific payment-related validation errors or cart/user issues.
     * @throws {Error} - Thrown for internal server errors during payment URL retrieval.
     */
    getPaymentUrl: async (
      parent: any,
      args: Record<"userID", string>,
      context: any,
      info: GraphQLResolveInfo
    ) => {
      try {
        return await paymentServices.getPaymentUrl(context.user.id);
      } catch (error) {
        if (error instanceof CustomError) {
          if (
            error.code === "STRIPE_KEY_NOT_FOUND" ||
            error.code === "CART" ||
            error.code === "USER_EXISTS"
          ) {
            throw new UserInputError(error.message);
          }
        }
        throw new Error(PaymentMessage.InternalServerError);
      }
    },

    /**
     * Handles order success logic for a user (requires authentication).
     *
     * @param {Object} parent - Parent object in the GraphQL resolution chain (often unused).
     * @param {Object} args - Arguments for order success processing.
     * @param {string} args.userID - The ID of the user (from context).
     * @param {Object} context - Context object containing authentication and other data.
     * @param {GraphQLResolveInfo} info - Information about the current GraphQL resolution.
     * @returns {Promise<{ message: string }>} Promise that resolves to an object containing a success message.
     * @throws {UserInputError} - Thrown for validation errors during order success processing.
     * @throws {Error} - Thrown for internal server errors during order success processing.
     */
    orderSuccess: async (
      parent: any,
      args: Record<"userID", string>,
      context: any,
      info: GraphQLResolveInfo
    ) => {
      try {
        const message = await paymentServices.orderSuccess(context.user.id);
        return { message };
      } catch (error) {
        if (error instanceof CustomError) {
          if (error.code === "VALIDATION_ERROR") {
            throw new UserInputError(error.message);
          }
        }
        throw new Error(PaymentMessage.InternalServerError);
      }
    },

    /**
     * Fetches a generic placed order message (unauthenticated).
     *
     * @param {Object} parent - Parent object in the GraphQL resolution chain (often unused).
     * @param {Object} args - Empty arguments object (unused).
     * @param {Object} context - Context object (unused for this resolver).
     * @param {GraphQLResolveInfo} info - Information about the current GraphQL resolution.
     * @returns {Promise<{ message: string }>} Promise that resolves to an object containing a generic placed order message.
     * @throws {Error} - Thrown for internal server errors during generic message retrieval.
     */
    placedOrder: async () => {
      try {
        const message = await paymentServices.placedOrder();
        return { message };
      } catch (error) {
        throw new Error(PaymentMessage.InternalServerError);
      }
    },
  },
};

export default paymentResolvers;
