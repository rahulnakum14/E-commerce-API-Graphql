// Defaults
import { isValidObjectId } from "mongoose";

// Model And Types
import CartModel from "../models/cartModel";
import ProductModel from "../models/productModel";
import CartAttributes from "../types/cartType";

// Constants
import {
  CartMessages,
  PaymentMessage,
  ProductMessage,
} from "../utills/constants";

//Error Handlers
import {
  CartError,
  ProductError,
  ValidationError,
} from "../utills/custom_error";


class CartServices {
  /**
   * Retrieves cart details for a given user ID.
   *
   * @async
   * @param {string} userID - The ID of the user whose cart details are to be retrieved.
   * @returns {Promise<CartAttributes[]>} A promise that resolves to an array of `CartAttributes` objects,
   * @throws {MongooseError} - Throw a Mongoose error if there's an issue with the database query.
   */
  async getCartDetails(userID: string): Promise<any[]> {
    const cartDetails = await CartModel.find({ cart_user: userID })
    .populate({
      path: 'products.product_id',
      model: 'productModel',
      select: ['product_name', 'product_price'] // Include product_price in select
    })
    .populate({
      path: 'cart_user',
      model: 'userModel',
    });

  const transformedCartDetails = cartDetails.map(cart => ({
    ...cart.toObject(),
    id: cart.id.toString(),
    products: cart.products.map(product => ({
      ...product,
      product_name: (product.product_id as any).product_name,
      price: (product.product_id as any).product_price,
      quantity: product.quantity,
      product_id: (product.product_id as any)._id.toString() 
    })),
    cart_user: {
      ...(cart.cart_user as any).toObject(),
      id: (cart.cart_user as any)._id.toString(),
    }
  }));

  return transformedCartDetails;
  }

  /**
   * Adds a product to the user's cart.
   *
   * @async
   * @param {string} userID - The ID of the user for whom the product is being added to the cart.
   * @param {string} product_id - The ID of the product to be added.
   * @param {string} quantity - The quantity of the product to be added.
   * @returns {Promise<{ success: boolean; message: string; data?: CartAttributes }>}
   *          A promise that resolves to an object with the following properties:
   *          - `success`: A boolean indicating whether the product was successfully added to the cart.
   *          - `message`: A message indicating the outcome of the operation.
   *          - `data` (optional): An object containing the updated cart details if successful.
   * @throws {ValidationError} - Thrown if the product ID is not a valid ObjectId.
   * @throws {ProductError} - Thrown if the product with the given ID is not found.
   */
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
    const cart_details = await CartModel.findOne({ cart_user: userID })
      .populate({
        path: "cart_user",
        model: "userModel",
      })
      .populate("products");

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

  /**
   * Removes a product from the user's cart.
   *
   * @async
   * @param {string} userID - The ID of the user for whom the product is being removed from the cart.
   * @param {string} product_id - The ID of the product to be removed.
   * @returns {Promise<{ success: boolean; message: string; data?: CartAttributes }>}
   *          A promise that resolves to an object with the following properties:
   *          - `success`: A boolean indicating whether the product was successfully removed from the cart.
   *          - `message`: A message indicating the outcome of the operation.
   *          - `data` (optional): An object containing the updated cart details if successful.
   * @throws {CartError} - Thrown if the user's cart is not found or the product is not present in the cart.
   * @throws {ValidationError} - Thrown if the product ID is not a valid ObjectId.
   */
  async removeProductCart(
    userID: string,
    product_id: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: CartAttributes;
  }> {
    const cartExist = await CartModel.findOne({ cart_user: userID })
      .populate({
        path: "cart_user",
        model: "userModel",
      })
      .populate("products");

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
      throw new CartError(CartMessages.ProductNotInCart);
    }
  }
}

export default new CartServices();
