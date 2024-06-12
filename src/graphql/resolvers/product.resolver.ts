import { ApolloError, UserInputError } from "apollo-server-errors";
import { CustomError } from "../../utills/custom_error";
import productServices from "../../services/product.services";
import logger from "../../utills/logger";
import { Errors } from "../../utills/constants";
import { GraphQLResolveInfo } from 'graphql';

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
      context: any, //UserContext
      info: GraphQLResolveInfo
    ) => {
      console.log('this is the context',context);
      
      if (!context.user) {
        console.log('this is context user',context.user);
        
        throw new ApolloError(Errors.authenticated);
      }
      return await productServices.getAllProducts();
    },
  },

  Mutation: {
    async createProduct(
      _: any,
      args: Record<'product_name' | 'product_price', string>,
      context: any, //UserContext
      info: GraphQLResolveInfo
    ) {
      try {
        // if(AuthMiddleware.restrictTo(context.user.role)){
        //   console.log('allowed to access', context.user.role);
        //   return;
        // }
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
            message: "Product not found",
            data: null,
          };
        }
        return {
          success: true,
          message: "Product updated successfully",
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
            message: "Product not found",
            data: null,
          };
        }
        return {
          success: true,
          message: "Product deleted successfully",
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
