import mongoose, { Schema } from "mongoose";
import CartAttributes from "../types/cartType";

/**
 * @typedef {Object} CartAttributes - Defines the attributes of a shopping cart.
 * @property {Array<CartItem>} products - An array of items in the cart.
 * @property {string} cart_user - The ID of the user who owns the cart (references the userModel collection). (Required)
 * @property {number} total_price - The total price of all items in the cart. (Required)
 */
const cartSchema: Schema<CartAttributes> = new Schema(
  {
    products: [
      {
        product_id: {
          type: String,
          ref: "ProductModel",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    cart_user: {
      type: String,
      ref: "userModel",
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "cartModel",
  }
);

const CartModel = mongoose.model<CartAttributes>("cartModel", cartSchema);

export default CartModel;
