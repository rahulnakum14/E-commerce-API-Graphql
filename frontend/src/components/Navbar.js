// src/Navbar.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

function Navbar() {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
  
    const handleLogout = () => {
      logout();
      navigate('/login');
    };
  
    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
    };
  
    return (
      <nav className="bg-black text-white py-4 px-8 flex justify-between items-center w-full">
        <div className="flex items-center">
          {isAuthenticated ? (
            <>
              <Link to="/" className="mr-4">Home</Link>
              <Link to="/products" className="mr-4">Products</Link>

              <Link to="/cart" className="mr-4">Cart</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4">Login</Link>
              <Link to="/signup" className="mr-4">Signup</Link>
            </>
          )}
        </div>
        {isAuthenticated && (
          <div className="relative">
            <button onClick={toggleDropdown} className="focus:outline-none">
              <FaUserCircle size={24} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-20">
                <div className="py-2">
                  <button onClick={handleLogout} className="block px-4 py-2 w-full text-left hover:bg-gray-200">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    );
  }
  
export default Navbar;
