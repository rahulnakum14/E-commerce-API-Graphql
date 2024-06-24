// Models
import ProductModel from "../models/productModel";

//Constants, Types and Error Handler
import { Errors, ProductMessage } from "../utills/constants";
import ProductAttributes from "../types/productType";

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
    const products = await ProductModel.find({}).lean();
    return products.map(product => ({
      ...product,
      id: product._id.toString(),
    }));
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
      Logger.error(
        "Product Validation Failed createProduct - in service",
        ProductMessage.Validation
      );
    }
    const newProduct = new ProductModel({
      product_name: product_name,
      product_price: product_price,
    });

    await newProduct.save();

    Logger.info(
      "Product created successfully - in service",
      ProductMessage.CreateSuccess
    );

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
    const result = await ProductModel.findByIdAndUpdate(
      id,
      { product_name, product_price },
      { new: true }
    );
    if (result) {
      Logger.info(
        "Product Updated successfully - in service",
        ProductMessage.UpdateSuccess
      );
      return result;
    } else {
      Logger.info(
        "Something Went Wrong while Updated product - in service",
        Errors.UpdateProductError
      );
      return null;
    }
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
    const result = await ProductModel.findByIdAndDelete(id);
    if (result) {
      Logger.info(
        "Product deleted successfully - in service",
        ProductMessage.DeleteSuccess
      );
      return result;
    } else {
      Logger.info(
        "Something Went Wrong while delete product - in service",
        Errors.DeleteProductError
      );
      return null;
    }
  }
}

export default new ProductService();
