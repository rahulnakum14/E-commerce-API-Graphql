// Defaults
import { GraphQLResolveInfo } from "graphql";
import { ApolloError, UserInputError } from "apollo-server-errors";

// Other Configs
import cartServices from "../../services/cart.services";
import { CartMessages, Errors } from "../../utills/constants";
import { CustomError } from "../../utills/custom_error";

const cartResolvers = {
  /**
   * Represents the Query type in the GraphQL schema.
   *
   * @typedef {Object} Query
   */
  Query: {
    /**
     * Fetches details of the current user's cart (requires authentication).
     *
     * @param {Object} parent - Parent object in the GraphQL resolution chain (often unused).
     * @param {Object} args - Arguments for getting cart details.
     * @param {string} args.userID - The ID of the user (from context).
     * @param {Object} context - Context object containing authentication and other data.
     * @param {GraphQLResolveInfo} info - Information about the current GraphQL resolution.
     * @returns {Promise<CartDetails>} Promise that resolves to an object containing cart details.
     * @throws {ApolloError} - Thrown for errors during cart details retrieval.
     */
    getCartDetails: async (
      parent: any,
      args: Record<"userID", string>,
      context: any,
      info: GraphQLResolveInfo
    ) => {
      try {
        const cartDetails = await cartServices.getCartDetails(context.user.id);
        return cartDetails;
      } catch (error) {
        throw new ApolloError(Errors.GetCartDetails);
      }
    },
  },

  /**
   * Represents the Mutation type in the GraphQL schema.
   *
   * @typedef {Object} Mutation
   */
  Mutation: {
    /**
     * Adds a product to the user's cart (requires authentication).
     *
     * @param {Object} parent - Parent object in the GraphQL resolution chain (often unused).
     * @param {Object} args - Arguments for adding a product to the cart.
     * @param {string} args.user.id - The ID of the user (from context).
     * @param {string} args.product_id - The ID of the product to add.
     * @param {string} args.quantity - The quantity of the product to add.
     * @param {Object} context - Context object containing authentication and other data.
     * @param {GraphQLResolveInfo} info - Information about the current GraphQL resolution.
     * @returns {Promise<ProductResponse>} Promise that resolves to a response object indicating success or failure and potentially cart data.
     * @throws {UserInputError} - Thrown for validation errors or product-related issues.
     * @throws {Error} - Thrown for errors during product addition to cart, including specific message for "Add to Cart" error.
     */
    async addProductCart(
      _: any,
      args: Record<"user.id" | "product_id" | "quantity", string>,
      context: any,
      info: GraphQLResolveInfo
    ) {
      try {
        const productAdded = await cartServices.addProductCart(
          context.user.id,
          args.product_id,
          args.quantity
        );
        if (productAdded.success) {
          return {
            success: productAdded.success,
            message: productAdded.message,
            data: productAdded.data,
          };
        } else {
          throw new ApolloError(Errors.CreateProductError);
        }
      } catch (error) {
        if (error instanceof CustomError) {
          if (error.code === "PRODUCT" || error.code === "VALIDATION_ERROR") {
            throw new UserInputError(error.message);
          }
        }
        throw new Error(CartMessages.AddToCartError);
      }
    },
    
    /**
     * Removes a product from the user's cart (requires authentication).
     *
     * @param {Object} parent - Parent object in the GraphQL resolution chain (often unused).
     * @param {Object} args - Arguments for removing a product from the cart.
     * @param {string} args.user.id - The ID of the user (from context).
     * @param {string} args.product_id - The ID of the product to remove.
     * @param {Object} context - Context object containing authentication and other data.
     * @param {GraphQLResolveInfo} info - Information about the current GraphQL resolution.
     * @returns {Promise<ProductResponse>} Promise that resolves to a response object indicating success or failure and potentially cart data.
     * @throws {UserInputError} - Thrown for validation errors or cart-related issues.
     * @throws {Error} - Thrown for errors during product removal from cart, including specific message for "Remove from Cart" error.
     */
    async removeProductCart(
      _: any,
      args: Record<"user.id" | "product_id", string>,
      context: any,
      info: GraphQLResolveInfo
    ) {
      try {
        const productremoved = await cartServices.removeProductCart(
          context.user.id,
          args.product_id
        );
        if (productremoved.success) {
          return {
            success: productremoved.success,
            message: productremoved.message,
            data: productremoved.data,
          };
        } else {
          throw new ApolloError(CartMessages.RemoveFromCartError);
        }
      } catch (error) {
        if (error instanceof CustomError) {
          if (error.code === "CART" || error.code === "VALIDATION_ERROR") {
            throw new UserInputError(error.message);
          }
        }
        throw new Error(CartMessages.RemoveFromCartError);
      }
    },
  },
};

export default cartResolvers;
