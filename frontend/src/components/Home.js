// src/Home.js
import React from 'react';

function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to the Home Page!</h1>
        <p className="text-blue-500 mb-4">
          This Is The Main Landing Page.
        </p>
        {/* <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Logout
        </button> */}
      </div>
    </div>
  );
}

export default Home;
