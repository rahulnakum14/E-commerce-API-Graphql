import { GraphQLResolveInfo } from "graphql";
import cartServices from "../../services/cart.services";
import { ApolloError } from "apollo-server-errors";
import { Errors } from "../../utills/constants";

const cartResolvers = {
  Query: {
    getCartDetails: async (
      parent: any,
      args: Record<"userID", string>,
      context: any,
      info: GraphQLResolveInfo
    ) => {
      console.log("User ID from context:", context.user.id);
      const cartDetails = await cartServices.getCartDetails(context.user.id);
      console.log("this is resolvers", cartDetails);
      return cartDetails;
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
        console.log(error);
        throw new Error("Error Form Resolver while adding product to cart.");
      }
    },
  },
};

export default cartResolvers;
