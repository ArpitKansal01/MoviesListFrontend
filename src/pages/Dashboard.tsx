import React, { useEffect, useState } from "react";
import { getProfile } from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard: React.FC = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("Token:", localStorage.getItem("token"));

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await getProfile(token);
        setMessage(res.data.message);
      } catch (err) {
        toast.error("Session expired. Login again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">{message}</p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white p-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
