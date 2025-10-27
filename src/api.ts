import axios from "axios";

const API_URL = "https://movieslistbackend.onrender.com/api/auth";

export const signupUser = async (data: {
  username: string;
  email: string;
  password: string;
}) => axios.post(`${API_URL}/signup`, data);

export const loginUser = async (data: { email: string; password: string }) =>
  axios.post(`${API_URL}/login`, data);

export const getProfile = (token: string) =>
  axios.get("https://movieslistbackend.onrender.com/api/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
