import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { REGISTER_USER } from '../queries/registerUser';

// Define the schema using yup
const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const [registerUser, { loading, error }] = useMutation(REGISTER_USER);

  const onSubmit = async data => {
    const { username, email, password } = data;
    try {
      const { data: { registerUser: { success, message } } } = await registerUser({
        variables: { username, email, password }
      });
      console.log(success, message); // Handle success
    } catch (error) {
      console.error('Registration failed:', error); // Handle error
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              {...register('username')}
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {loading ? 'Signing up...' : 'Signup'}
          </button>
          {error && <p className="text-red-500 text-xs mt-1">Signup failed. Please try again.</p>}
        </form>
      </div>
    </div>
  );
}

export default Signup;
