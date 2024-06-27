import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { VERIFY_EMAIL } from '../queries/verifyEmail';

function VerifyEmail() {
  const [verifyEmail, { data, loading, error }] = useMutation(VERIFY_EMAIL);
  const [message, setMessage] = useState('');
  const location = useLocation();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    if (token) {
      verifyEmail({ variables: { signupToken: token } })
        .then(response => {
          if (response.data.verifyEmail.success) {
            setMessage('Email verified successfully!');
          } else {
            setMessage('Invalid token or email verification failed.');
          }
        })
        .catch(err => {
          setMessage('An error occurred during verification.');
          console.error(err);
        });
    } else {
      setMessage('Invalid token.');
    }
  }, [location.search, verifyEmail]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        {loading ? (
          <p className="text-blue-500">Verifying...</p>
        ) : (
          <p className={`text-lg ${data?.verifyEmail.success ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
