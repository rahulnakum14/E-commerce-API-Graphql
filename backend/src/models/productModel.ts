import mongoose, { Schema } from "mongoose";
import ProductAttributes from "../types/productType";

/**
 * @typedef {Object} ProductAttributes - Defines the attributes of a product.
 * @property {string} product_name - The name of the product. (Required)
 * @property {string} product_price - The price of the product. (Required)
 */
const productSchema: Schema<ProductAttributes> = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_price: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "productModel",
  }
);

const ProductModel = mongoose.model<ProductAttributes>("productModel", productSchema);

export default ProductModel;
