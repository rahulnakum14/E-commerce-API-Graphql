// Defaults 
import { GraphQLResolveInfo } from "graphql";
import { ApolloError, UserInputError } from "apollo-server-errors";

// Other Configs
import { CustomError } from "../../utills/custom_error";
import productServices from "../../services/product.services";
import logger from "../../utills/logger";
import { Errors, ProductMessage } from "../../utills/constants";


/** UserContext.ts */
// import { BaseContext } from "@apollo/server";
// import UserAttributes from "../types/userType";

// interface UserContext extends BaseContext {
//   user: UserAttributes;
// }

// export default UserContext;

const productResolvers = {
  /**
   * Represents the Query type in the GraphQL schema.
   *
   * @typedef {Object} Query
   */
  Query: {
    /**
     * Fetches all products in the system.
     *
     * @param {Object} parent - Parent object in the GraphQL resolution chain (often unused).
     * @param {Object} args - Arguments for filtering or sorting products (optional).
     * @param {Object} context - Context object containing authentication and other data.
     * @param {GraphQLResolveInfo} info - Information about the current GraphQL resolution.
     * @returns {Promise<Product[]>} Promise that resolves to an array of Product objects.
     * @throws {ApolloError} - Thrown for errors during product retrieval.
     */
    getProducts: async (
      parent: any,
      args: Record<string, any>,
      context: any,
      info: GraphQLResolveInfo
    ) => {
      try {
        return await productServices.getAllProducts();
      } catch (error) {
        throw new ApolloError(Errors.GetAllProductsError);
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
     * Creates a new product in the system.
     *
     * @param {Object} parent - Parent object in the GraphQL resolution chain (often unused).
     * @param {Object} args - Arguments for creating a product.
     * @param {string} args.product_name - The name of the product (required).
     * @param {string} args.product_price - The price of the product (required).
     * @param {Object} context - Context object containing authentication and other data.
     * @param {GraphQLResolveInfo} info - Information about the current GraphQL resolution.
     * @returns {Promise<ProductResponse>} Promise that resolves to a response object indicating success or failure.
     * @throws {UserInputError} - Thrown for validation errors or product-related issues.
     * @throws {ApolloError} - Thrown for other unexpected errors during product creation.
     */
    async createProduct(
      _: any,
      args: Record<"product_name" | "product_price", string>,
      context: any,
      info: GraphQLResolveInfo
    ) {
      try {
        const result = await productServices.createProduct(
          args.product_name,
          args.product_price
        );
        if (result.success) {
          return {
            success: result.success,
            message: result.message,
            data: result.data,
          };
        } else {
          throw new ApolloError(Errors.CreateProductError);
        }
      } catch (error) {
        if (error instanceof CustomError) {
          if (error.code === "VALIDATION_ERROR" || error.code === "Product") {
            throw new UserInputError(error.message);
          }
        }
        logger.fatal(Errors.CreateProductError);
        throw new ApolloError(Errors.GenericError);
      }
    },

    /**
     * Updates an existing product in the system.
     *
     * @param {Object} parent - Parent object in the GraphQL resolution chain (often unused).
     * @param {Object} args - Arguments for updating a product.
     * @param {string} args.id - The ID of the product to update (required).
     * @param {string} args.product_name - The updated name of the product.
     * @param {string} args.product_price - The updated price of the product.
     * @param {Object} context - Context object containing authentication and other data.
     * @param {GraphQLResolveInfo} info - Information about the current GraphQL resolution.
     * @returns {Promise<ProductResponse>} Promise that resolves to a response object indicating success or failure and updated product data (if successful).
     * @throws {ApolloError} - Thrown for errors during product update, including "not found" errors.
     */
    async updateProduct(
      _: any,
      args: { id: string; product_name: string; product_price: string }
    ) {
      try {
        const upatedProduct = await productServices.updateProduct(
          args.id,
          args.product_name,
          args.product_price
        );
        if (!upatedProduct) {
          return {
            success: false,
            message: ProductMessage.NotFound,
            data: null,
          };
        }
        return {
          success: true,
          message: ProductMessage.UpdateSuccess,
          data: upatedProduct,
        };
      } catch (error) {
        logger.error(Errors.UpdateProductError);
        throw new ApolloError(Errors.UpdateProductError);
      }
    },

    /**
     * Deletes an existing product from the system.
     *
     * @param {Object} parent - Parent object in the GraphQL resolution chain (often unused).
     * @param {Object} args - Arguments for deleting a product.
     * @param {string} args.id - The ID of the product to delete (required).
     * @param {Object} context - Context object containing authentication and other data.
     * @param {GraphQLResolveInfo} info - Information about the current GraphQL resolution.
     * @returns {Promise<ProductResponse>} Promise that resolves to a response object indicating success or failure and deleted product data (if successful).
     * @throws {ApolloError} - Thrown for errors during product deletion, including "not found" errors.
     */
    async deleteProduct(_: any, args: { id: string }) {
      try {
        const deleteProduct = await productServices.deleteProduct(args.id);
        if (!deleteProduct) {
          return {
            success: false,
            message: ProductMessage.NotFound,
            data: null,
          };
        }
        return {
          success: true,
          message: ProductMessage.DeleteSuccess,
          data: deleteProduct,
        };
      } catch (error) {
        logger.error(Errors.DeleteProductError);
        throw new ApolloError(Errors.DeleteProductError);
      }
    },
  },
};

export default productResolvers;
