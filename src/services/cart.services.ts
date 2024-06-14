import CartModel from "../models/cartModel";
import ProductModel from "../models/productModel";
import CartAttributes from "../types/cartType";
import { CartMessages } from "../utills/constants";
import { ProductError } from "../utills/custom_error";

class CartServices {
  async getCartDetails(
    userID: string
  ): Promise<CartAttributes[] | null | string> {
    try {
      const result = await CartModel.find({ cart_user: userID }).populate(
        "products"
      );
      console.log("this is services", result);
      return result;
    } catch (error) {
      throw new Error("Something Wrong Happened while fetching Cart Products.");
    }
  }

  async addProductCart(userID: string, product_id: string, quantity: string) {
    try {
      const product_exist = await ProductModel.findOne({ _id: product_id });

      if (!product_exist) {
        throw new ProductError("Product Does not Exists.");
      }

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

      console.log(JSON.parse(JSON.stringify(newCart, null)));

      return {
        success: true,
        message: CartMessages.ProductAdded,
        data: newCart,
      };
      
    } catch (error) {
      throw new Error("Something went wrong while adding product to cart.");
    }
  }
}

export default new CartServices();
