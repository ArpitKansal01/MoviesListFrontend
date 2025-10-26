import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const signupUser = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  return axios.post(`${API_URL}/signup`, data);
};

export const loginUser = async (data: { email: string; password: string }) => {
  return axios.post(`${API_URL}/login`, data);
};

export const getProfile = (token: string) =>
  axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
