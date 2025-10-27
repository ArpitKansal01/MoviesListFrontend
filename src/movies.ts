import axios from "axios";

const API_URL = "https://movieslistbackend.onrender.com/api";

export const fetchMovies = (userId: number, page: number, limit: number) =>
  axios.get(`${API_URL}/movies`, {
    params: { userId, page, limit },
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const addMovie = (data: any) =>
  axios.post(`${API_URL}/movies`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const updateMovie = (id: number, data: any) =>
  axios.put(`${API_URL}/movies/${id}`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const deleteMovie = (id: number) =>
  axios.delete(`${API_URL}/movies/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
