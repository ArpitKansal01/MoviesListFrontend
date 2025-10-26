import React, { useState } from "react";
import { signupUser } from "../api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const Signup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await signupUser({ username, email, password });
      toast.success("Signup successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      toast.error(
        err.response?.data?.message || err.message || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-linear-to-r from-blue-100 via-purple-100 to-pink-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-10 rounded-2xl shadow-2xl w-96 max-w-full transform scale-95 opacity-0 animate-fadeIn transition-all"
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-300"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-300"
          required
        />

        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-300 pr-10"
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer border border-gray-400 rounded-lg text-gray-500 hover:text-gray-700 select-none"
          >
            {showPassword ? "👁️" : "🙈"}
          </span>
        </div>

        <button
          type="submit"
          className={`w-full bg-linear-to-r from-blue-500 to-purple-500 text-white font-semibold p-3 rounded-lg mb-4 shadow transform transition duration-300 hover:scale-105 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.5s ease-out forwards;
            }
          `}
        </style>
      </form>
    </div>
  );
};

export default Signup;
