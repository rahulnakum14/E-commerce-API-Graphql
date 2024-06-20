// Models
import ProductModel from "../models/productModel";

//Constants, Types and Error Handler
import { ProductMessage } from "../utills/constants";
import ProductAttributes from "../types/productType";
import { ValidationError } from "../utills/custom_error";
import client from '../config/redis';
import { Types } from "mongoose";

class ProductService {

  // Setting up the cache_expiration
  static CACHE_EXPIRATION = parseInt(process.env.CACHE_EXPIRATION || '3600', 10); // Cache expiration time in seconds

  /**
   * Retrieves all products from the database.
   *
   * @async
   * @returns {Promise<ProductAttributes[]>} A promise that resolves to an array of `ProductAttributes` objects,
   *                                          representing all products in the database.
   * @throws {MongooseError} - May throw a Mongoose error if there's an issue with the database query.
   */
  async getAllProducts(): Promise<ProductAttributes[]> {
    const cacheKey = 'allProducts';

    // Try to get data from Redis cache
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log('Data fetched from cache');
      const products = JSON.parse(cachedData);
      return products.map((product: any) => ({
        id: product._id.toString(), // Transform _id to string as needed
        product_name: product.product_name,
        product_price: product.product_price,
      }));
    }

    console.log('Cache miss. Fetching from database...');
    // If no cache, fetch from database
    const products = await ProductModel.find({});

    // Cache the fetched data
    await client.set(cacheKey, JSON.stringify(products), 'EX', ProductService.CACHE_EXPIRATION);
    console.log('Data cached');
    return products;
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

    // Save the new product to MongoDB
    await newProduct.save();

    // Update cache after successful creation
    const cacheKey = `product:${newProduct._id}`;
    await client.set(cacheKey, JSON.stringify(newProduct), 'EX', ProductService.CACHE_EXPIRATION);

    // Invalidate all products cache
    await client.del('allProducts');

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
    console.log('this is id',id);
    console.log('this is id',typeof(id));

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id.toString(),
      { product_name, product_price },
      { new: true }
    );
    
    if (updatedProduct) {
      console.log('this is updated product called');
      const cacheKey = `product:${id}`;
      await client.set(cacheKey, JSON.stringify(updatedProduct), 'EX', ProductService.CACHE_EXPIRATION);

      // Invalidate all products cache
      await client.del('allProducts');
    }
    return updatedProduct;
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
    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (deletedProduct) {
      console.log('this is deletedProduct called');
      const cacheKey = `product:${id}`;
      await client.del(cacheKey);

      // Invalidate all products cache
      await client.del('allProducts');

      return deletedProduct;
    } else {
      return null; // Product not found or already deleted
    }
  }
}

export default new ProductService();
