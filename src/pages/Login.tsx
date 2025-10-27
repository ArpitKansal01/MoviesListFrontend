import React, { useState } from "react";
import { loginUser } from "../api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

interface LoginProps {
  onLoginSuccess?: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email, password });

      const token = res?.data?.token;
      if (!token) throw new Error("No token returned from server");

      localStorage.setItem("token", token);
      onLoginSuccess?.(token); // 👈 Update App state immediately
      toast.success("Login successful!");

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-linear-to-r from-blue-100 via-purple-100 to-pink-100">
      <form
        className="bg-white p-10 rounded-2xl shadow-2xl w-96 max-w-full"
        onSubmit={handleLogin}
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          Welcome Back
        </h2>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-1 font-medium text-gray-600"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            required
          />
        </div>

        <div className="mb-6 relative">
          <label
            htmlFor="password"
            className="block mb-1 font-medium text-gray-600"
          >
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition pr-10"
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 cursor-pointer border border-gray-400 rounded-lg text-gray-500 hover:text-gray-700 select-none"
          >
            {showPassword ? "👁️" : "🙈"}
          </span>
        </div>

        <button
          type="submit"
          className={`w-full bg-linear-to-r from-blue-500 to-purple-500 text-white font-semibold p-3 rounded-lg mb-4 shadow  transform transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
