import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { VERIFY_EMAIL } from "../graphql/queries";

function VerifyEmail() {
  const { token } = useParams();

  const [message, setMessage] = useState("");

  const { data, loading } = useQuery(VERIFY_EMAIL, {
    variables: { signupToken: token },
    skip: !token,
    onCompleted: (data) => {
      if (data.verifyEmail.success) {
        setMessage("Email verified successfully!");
      } else {
        setMessage("Invalid token or email verification failed.");
      }
    },
    onError: (error) => {
      setMessage("An error occurred during verification.");
      console.error("Query error:", error);
    },
  });

  useEffect(() => {
    if (!token) {
      setMessage("Invalid token.");
    }
  }, [token]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        {loading ? (
          <p className="text-blue-500">Verifying...</p>
        ) : (
          <p
            className={`text-lg ${
              data?.verifyEmail.success ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
