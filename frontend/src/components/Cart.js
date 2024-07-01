import React from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_CART_DETAILS, GET_PAYMENT_URL } from "../graphql/queries";

const Cart = () => {
  const { loading, error, data } = useQuery(GET_CART_DETAILS, GET_PAYMENT_URL);
  const [getPaymentUrl, { loading: loadingPayment, error: errorPayment, data: dataPayment }] = useLazyQuery(GET_PAYMENT_URL);

  if (loading || loadingPayment) return <p>Loading...</p>;
  if (error || errorPayment) return <p>Error: {error.message}</p>;

  const { getCartDetails } = data;

  const checkOut = () => {
    getPaymentUrl();
  };

  if (dataPayment) {
    const { PaymentUrl } = dataPayment.getPaymentUrl;
    window.location.href = PaymentUrl;
    return null; // Avoid rendering the cart when redirecting
  }

  if (!getCartDetails || getCartDetails.length === 0) {
    return (
      <div className="container mx-auto mt-4 text-center">
        <p className="text-gray-600 text-lg">Your cart is empty</p>
      </div>
    );
  }

  const totalQuantity = getCartDetails.reduce(
    (acc, cartItem) =>
      acc + cartItem.products.reduce((sum, product) => sum + parseInt(product.quantity, 10), 0),
    0
  );

  const totalPrice = parseFloat(getCartDetails[0].total_price).toFixed(2);

  return (
    <div className="container mx-auto mt-4">
      <div className="p-4 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Your Cart</h2>
        <div className="grid grid-cols-1 gap-4 mb-4">
          {getCartDetails.map((cartItem) => (
            <div key={cartItem.id} className="border p-4 rounded-lg shadow-md bg-gray-50">
              {cartItem.products.map((product) => (
                <div key={product.product_id} className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    {/* Replace the src with your image URL */}
                    {/* <img
                      src={`url-to-your-image/${product.product_id}`}
                      alt={product.product_name}
                      className="w-16 h-16 object-cover mr-4"
                    /> */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{product.product_name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700">Quantity: {product.quantity}</p>
                    <p className="text-gray-700">${parseFloat(product.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="text-right mb-4">
          <p className="text-xl font-bold text-gray-700">Total Quantity: {totalQuantity}</p>
          <p className="text-xl font-bold text-gray-700">Total Price: ${totalPrice}</p>
        </div>
        <div className="text-center">
          <button
            onClick={checkOut}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
