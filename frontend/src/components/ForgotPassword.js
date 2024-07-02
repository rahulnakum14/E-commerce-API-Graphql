import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { FORGOT_PASSWORD } from "../graphql/mutations";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [forgotPassword, { loading, error }] = useMutation(FORGOT_PASSWORD);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await forgotPassword({ variables: { email } });
      toast.success("Reset Link Sent SuccessFully.");
      console.log("Email sent:", data.forgotPassword); 
    } catch (err) {
      console.error("Forgot password failed:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <form onSubmit={handleSubmit}>
      <ToastContainer />

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-bold text-gray-700 mb-2"
          >
            Email Address
          </label>
          <input
            style={{ width: "400px" }}
            className="max-w-md shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Link"}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs italic text-red-500">
            Error: {error.message}
          </p>
        )}
      </form>
    </div>
  );
}

export default ForgotPassword;
