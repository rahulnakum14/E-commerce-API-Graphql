import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { VERIFY_PASSWORD } from '../graphql/mutations';

const VerifyPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
  
    const [forgotPassword, { loading, error, data }] = useMutation(VERIFY_PASSWORD, {
      onCompleted: (data) => {
        if (data && data.verifyForgotPassword) {
          if (data.verifyForgotPassword.success) {
            setMessage("Password reset successfully!");
          } else {
            setMessage(data.verifyForgotPassword.message || "Password reset failed.");
          }
        } else {
          setMessage("Unexpected response structure.");
        }
      },
      onError: (error) => {
        setMessage("An error occurred during verification.");
        console.error("Mutation error:", error);
      },
    });
  
    useEffect(() => {
      if (!token) {
        setMessage("Invalid token.");
      }
    }, [token]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!token) return;
  
      try {
        await forgotPassword({
          variables: { forgotPasswordToken: token, newPassword },
        });
      } catch (err) {
        console.error("Password reset error:", err);
      }
    };
  
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
          {loading ? (
            <p className="text-blue-500">Processing...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                />
              </div>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" disabled={loading}>
                {loading ? "Processing..." : "Reset Password"}
              </button>
              {error && <p className="text-red-500 text-xs italic mt-2">Error: {error.message}</p>}
              {message && (
                <p className={`text-lg ${data?.verifyForgotPassword?.success ? "text-green-500" : "text-red-500"}`}>
                  {message}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    );
  };
  

export default VerifyPassword;
