import { Errors, ProductMessage } from "../utills/constants";
import ProductModel from "../models/productModel";
import ProductAttributes from "../types/productType";
import { ValidationError } from "../utills/custom_error";
import { ApolloError } from "apollo-server-errors";


class ProductService {
  async getAllProducts(): Promise<ProductAttributes[]> {
   try {
     return await ProductModel.find({});
   } catch (error) {
    throw new ApolloError(Errors.GetAllProductsError);
   }
  }

  async createProduct(
    product_name: string,
    product_price: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: ProductAttributes;
  }> {
    if (!product_name || !product_price) {
      throw new ValidationError(ProductMessage.Validation);
    }

    const newProduct = new ProductModel({
      product_name: product_name,
      product_price: product_price,
    });

    await newProduct.save();

    return {
      success: true,
      message: ProductMessage.CreateSuccess,
      data: newProduct,
    };
  }

  async updateProduct(
    id: string, 
    product_name: string, 
    product_price: string
  ):Promise<ProductAttributes | null>{
    return await ProductModel.findByIdAndUpdate(
      id,
      { product_name,product_price},
      { new: true }
    );
  }

  async deleteProduct(id: string): Promise<ProductAttributes | null> {
    return await ProductModel.findByIdAndDelete(id);
  }


}

export default new ProductService();
