import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  useEffect(() => {
    // Keep token in sync if manually removed or updated
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/login"
        element={<Login onLoginSuccess={(t) => setToken(t)} />}
      />
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default App;
