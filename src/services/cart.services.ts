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


//Caching Using Redis
import client from '../config/redis';

class CartServices {

  static CACHE_EXPIRATION = parseInt(process.env.CACHE_EXPIRATION || '3600', 10); // Cache expiration time in seconds

  /**
   * Retrieves cart details for a given user ID.
   *
   * @async
   * @param {string} userID - The ID of the user whose cart details are to be retrieved.
   * @returns {Promise<CartAttributes[]>} A promise that resolves to an array of `CartAttributes` objects,
   * @throws {MongooseError} - Throw a Mongoose error if there's an issue with the database query.
   */
  async getCartDetails(userID: string): Promise<CartAttributes[]> {
    const cacheKey = 'userCarts';

    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      console.log('Data fetched from cache');
      const carts = JSON.parse(cachedData);
      return carts.map((cart: any) => ({
        ...cart,
        id: cart._id.toString(),
        cart_user: cart.cart_user ? {
          id: cart.cart_user._id.toString(),
          username: cart.cart_user.username,
          email: cart.cart_user.email,
          password: cart.cart_user.password,
        } : null,
      }));
    }

    console.log('Cache miss. Fetching from database...');

    const cartDetails = await CartModel.find({ cart_user: userID })
      .populate({
        path: "cart_user",
        model: "userModel",
      })
      .populate("products");      
    await client.set(cacheKey, JSON.stringify(cartDetails), 'EX', CartServices.CACHE_EXPIRATION);
    console.log('Data cached');
    return cartDetails;
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
      const cacheKey = `cart:${newCart._id}`;
      await client.set(cacheKey, JSON.stringify(newCart), 'EX', CartServices.CACHE_EXPIRATION);

      await client.del('userCarts');

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
      const cacheKey = `cart:${cartExist._id}`;
      await client.set(cacheKey, JSON.stringify(cartExist), 'EX', CartServices.CACHE_EXPIRATION);
      await client.del('userCarts');

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
