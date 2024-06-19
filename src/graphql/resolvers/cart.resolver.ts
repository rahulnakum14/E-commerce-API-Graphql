import { GraphQLResolveInfo } from "graphql";
import cartServices from "../../services/cart.services";
import { ApolloError, UserInputError } from "apollo-server-errors";
import { CartMessages, Errors } from "../../utills/constants";
import { CustomError } from "../../utills/custom_error";

const cartResolvers = {
  Query: {
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

  Mutation: {
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
        throw new Error(CartMessages.AddToCartError);
      }
    },
  },
};

export default cartResolvers;
