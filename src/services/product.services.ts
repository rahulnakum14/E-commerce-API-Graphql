// Models
import ProductModel from "../models/productModel";

//Constants, Types and Error Handler
import { ProductMessage } from "../utills/constants";
import ProductAttributes from "../types/productType";
import { ValidationError } from "../utills/custom_error";

class ProductService {
  /**
   * Retrieves all products from the database.
   *
   * @async
   * @returns {Promise<ProductAttributes[]>} A promise that resolves to an array of `ProductAttributes` objects,
   *                                          representing all products in the database.
   * @throws {MongooseError} - May throw a Mongoose error if there's an issue with the database query.
   */
  async getAllProducts(): Promise<ProductAttributes[]> {
    return await ProductModel.find({});
  }

  /**
   * Creates a new product in the database.
   *
   * @async
   * @param {string} product_name - The name of the product.
   * @param {string} product_price - The price of the product.
   * @returns {Promise<{ success: boolean; message: string; data?: ProductAttributes }>}
   *          A promise that resolves to an object with the following properties:
   *          - `success`: A boolean indicating whether the product was created successfully.
   *          - `message`: A message indicating the outcome of the operation.
   *          - `data` (optional): The newly created product object as `ProductAttributes`.
   * @throws {ValidationError} - Thrown if the product name or price is missing or invalid.
   */
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

  /**
   * Updates an existing product in the database.
   *
   * @async
   * @param {string} id - The ID of the product to be updated.
   * @param {string} product_name (optional) - The new name for the product.
   * @param {string} product_price (optional) - The new price for the product.
   * @returns {Promise<ProductAttributes | null>}
   *          A promise that resolves to the updated product object as `ProductAttributes`
   *          if successful, or null if the product with the given ID is not found.
   * @throws {ValidationError} - Thrown if the product name or price is invalid.
   */
  async updateProduct(
    id: string,
    product_name: string,
    product_price: string
  ): Promise<ProductAttributes | null> {
    return await ProductModel.findByIdAndUpdate(
      id,
      { product_name, product_price },
      { new: true }
    );
  }

  /**
   * Deletes a product from the database.
   *
   * @async
   * @param {string} id - The ID of the product to be deleted.
   * @returns {Promise<ProductAttributes | null>}
   *          A promise that resolves to the deleted product object as `ProductAttributes`
   *          if successful, or null if the product with the given ID is not found.
   * @throws {MongooseError} - Thrown if there's an issue with the database operation.
   */
  async deleteProduct(id: string): Promise<ProductAttributes | null> {
    return await ProductModel.findByIdAndDelete(id);
  }
}

export default new ProductService();
