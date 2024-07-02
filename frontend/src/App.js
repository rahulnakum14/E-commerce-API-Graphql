import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import  VerifyEmail  from "./components/VerifyEmail";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import ProtectedRoute from "./context/ProtectedRoute";
import Cart from "./components/Cart";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from './components/ResetPassword'

function App() {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user/verifyEmail/:token" element={<VerifyEmail />} />
        <Route path="/user/reset/reset-password/:token" element={<ResetPassword />} />

        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route
          path="/products"
          element={<ProtectedRoute element={<ProductList />} />}
        />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </div>
  );
}

export default App;
