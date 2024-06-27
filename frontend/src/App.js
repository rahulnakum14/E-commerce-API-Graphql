import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ApolloAppProvider from './ApolloProvider';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import VerifyEmail from './components/VerifyEmail'

function App() {
  return (
    <ApolloAppProvider>
      <Router>
        <div className="container mx-auto p-4">
          <nav className="mb-4">
            <Link to="/" className="mr-4 text-blue-500">Home</Link>
            <Link to="/login" className="mr-4 text-blue-500">Login</Link>
            <Link to="/signup" className="text-blue-500">Signup</Link>
          </nav>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </ApolloAppProvider>
  );
}

export default App;
