import { ApolloError, UserInputError } from "apollo-server-errors";
import { CustomError } from "../../utills/custom_error";
import productServices from "../../services/product.services";
import logger from "../../utills/logger";
import { Errors, ProductMessage } from "../../utills/constants";
import { GraphQLResolveInfo } from "graphql";

/** UserContext.ts */
// import { BaseContext } from "@apollo/server";
// import UserAttributes from "../types/userType";

// interface UserContext extends BaseContext {
//   user: UserAttributes;
// }

// export default UserContext;

const productResolvers = {
  Query: {
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

  Mutation: {
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
