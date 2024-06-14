import CartModel from "../models/cartModel";
import ProductModel from "../models/productModel";
import CartAttributes from "../types/cartType";
import { CartMessages } from "../utills/constants";
import { CartError, ProductError } from "../utills/custom_error";

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

      const cart_details = await CartModel.findOne({ cart_user: userID });

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

        console.log(JSON.parse(JSON.stringify(newCart, null)));

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
    } catch (error) {
      throw new Error(CartMessages.AddToCartError);
    }
  }

  async removeProductCart(userID: string, product_id: string) {
    try {
      const cartExist = await CartModel.findOne({ cart_user: userID });

      if (!cartExist) {
        throw new CartError("Cart Does not Exists.");
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

        console.log('this is before saving the removed product');
        

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
    } catch (error) {
      throw new Error(CartMessages.RemoveFromCartError);
    }
  }
}

export default new CartServices();
