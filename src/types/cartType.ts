// Mongooese Document
import mongoose, { Document } from "mongoose";

/**
 * Interface representing attributes of a user.
 * @interface CartAttributes 
 * @property {string} product_id[] - Array of the products in the cart.
 * @property {string} quantity - quantity of the product
 * @property {string} total_price - total_price of the cart.
 * @property {UserAttributes} cart_user - user of the cart. 
 */
interface CartAttributes extends Document {
  products: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  cart_user: mongoose.Types.ObjectId;
  total_price: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export default CartAttributes;