import { GraphQLResolveInfo } from "graphql";
import paymentServices from "../../services/payment.services";
import { CustomError } from "../../utills/custom_error";
import { CartMessages, PaymentMessage } from "../../utills/constants";
import { UserInputError } from "apollo-server-errors";

const paymentResolvers = {
  Query: {
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
