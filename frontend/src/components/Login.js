import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../graphql/mutations';

const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const [loginUser, { loading, error }] = useMutation(LOGIN_USER);

  const onSubmit = async data => {
    const { username, password } = data;
    try {
      const { data: { loginUser: { token, user } } } = await loginUser({ variables: { username, password } });
      console.log(token, user);
      // Handle success (e.g., store token, redirect)
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input {...register('username')} type="text" className="w-full p-2 border border-gray-300 rounded mt-1" />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input {...register('password')} type="password" className="w-full p-2 border border-gray-300 rounded mt-1" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="text-red-500 text-xs mt-2">{error.message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
