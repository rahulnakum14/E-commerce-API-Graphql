import CartModel from "../models/cartModel";
import ProductModel from "../models/productModel";
import CartAttributes from "../types/cartType";
import {
  CartMessages,
  PaymentMessage,
  ProductMessage,
} from "../utills/constants";
import {
  CartError,
  ProductError,
  ValidationError,
} from "../utills/custom_error";
import { isValidObjectId } from "mongoose";

class CartServices {
  async getCartDetails(userID: string): Promise<CartAttributes[]> {
    const cartDetails = await CartModel.find({ cart_user: userID }).populate({
      path: 'cart_user',
      model: 'userModel',
    }).populate('products');

    return cartDetails;
  }

  async addProductCart(
    userID: string,
    product_id: string,
    quantity: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: CartAttributes;
  }> {
    if (!isValidObjectId(product_id)) {
      throw new ValidationError(ProductMessage.InvalidIdFormat);
    }
    const product_exist = await ProductModel.findOne({ _id: product_id });

    if (!product_exist) {
      throw new ProductError(ProductMessage.NotFound);
    }

    // const cart_details = await CartModel.findOne({ cart_user: userID });
    const cart_details = await CartModel.findOne({ cart_user: userID }).populate({
      path: 'cart_user',
      model: 'userModel',
    }).populate('products');

    if (!cart_details) {
      const newCart = new CartModel({
        products: [
          {
            product_id: product_exist.id,
            quantity: quantity,
            price: Number(product_exist.product_price) * Number(quantity),
          },
        ],
        cart_user: userID,
        total_price: Number(product_exist.product_price) * Number(quantity),
      });

      await newCart.save();

      return {
        success: true,
        message: CartMessages.ProductAdded,
        data: newCart,
      };
    } else {
      const productIndex = cart_details.products.findIndex(
        (product) =>
          product.product_id.toString() === product_exist.id.toString()
      );
      if (productIndex > -1) {
        cart_details.products[productIndex].quantity += Number(quantity);
        cart_details.products[productIndex].price +=
          Number(product_exist.product_price) * Number(quantity);
        cart_details.total_price +=
          Number(product_exist.product_price) * Number(quantity);
      } else {
        cart_details.products.push({
          product_id: product_exist.id,
          quantity: Number(quantity),
          price: Number(product_exist.product_price) * Number(quantity),
        });
        cart_details.total_price +=
          Number(product_exist.product_price) * Number(quantity);
      }
    }
    await cart_details.save();
    return {
      success: true,
      message: CartMessages.ProductAdded,
      data: cart_details,
    };
  }

  async removeProductCart(
    userID: string,
    product_id: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: CartAttributes;
  }> {
    const cartExist = await CartModel.findOne({ cart_user: userID }).populate({
      path: 'cart_user',
      model: 'userModel',
    }).populate('products');

    if (!cartExist) {
      throw new CartError(PaymentMessage.CartNotFound);
    }

    if (!isValidObjectId(product_id)) {
      throw new ValidationError(ProductMessage.InvalidIdFormat);
    }
    
    const productExist = await ProductModel.findById(product_id);

    if (!productExist) {
      throw new CartError(CartMessages.ProductNotInCart);
    }

    const productIndex = cartExist.products.findIndex(
      (product) => product.product_id.toString() === product_id
    );
    if (productIndex > -1) {
      const product = cartExist.products[productIndex];
      cartExist.total_price -= product.price;
      cartExist.products.splice(productIndex, 1);

      if (cartExist.products.length === 0) {
        cartExist.total_price = 0;
      }

      await cartExist.save();
      return {
        success: true,
        message: CartMessages.ProductRemoved,
        data: cartExist,
      };
    } else {
      return {
        success: false,
        message: CartMessages.ProductNotInCart,
        data: cartExist,
      };
    }
  }
}

export default new CartServices();
