import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCTS } from "../graphql/queries";
import { FaCartPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { ADD_PRODUCT_CART } from '../graphql/mutations';
import defaultImage from '../assets/product.png'; 

import 'react-toastify/dist/ReactToastify.css';

function ProductList() {
  const { loading, error, data } = useQuery(GET_PRODUCTS);
  const [addProductCart] = useMutation(ADD_PRODUCT_CART);
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, quantity) => {
    setQuantities({
      ...quantities,
      [productId]: quantity,
    });
  };

  const addToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    addProductCart({
      variables: {
        product_id: product.id,
        quantity: String(quantity),
      },
    })
      .then((response) => {
        toast.success("Product Added To Cart.");
      })
      .catch((error) => {
        console.error("Error adding product to cart:", error);
        toast.error("Error adding product to cart.");
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const products = data?.getProducts || [];

  if (products.length === 0) {
    return <p>No products available</p>;
  }

  return (
    <div className="container mx-auto mt-4">
      <ToastContainer />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border p-4 rounded-lg shadow-md flex flex-col items-center"
          >
            <img
              src={defaultImage}
              alt={product.product_name}
              className="w-full h-48 object-cover mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">
              {product.product_name}
            </h3>
            <p className="text-gray-700 mb-4">${product.product_price}</p>
            <input
              type="number"
              min="1"
              value={quantities[product.id] || 1}
              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
              className="mb-2 border rounded p-1"
            />
            <button
              onClick={() => addToCart(product)}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <FaCartPlus className="mr-2" /> Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
