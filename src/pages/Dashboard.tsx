import React, { useEffect, useState, useRef, useCallback } from "react";
import { fetchMovies, addMovie, updateMovie, deleteMovie } from "../movies";
import { getProfile } from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Movie {
  id: number;
  title: string;
  type: string;
  director?: string;
  budget?: number;
  location?: string;
  duration?: string;
  year?: number;
  posterUrl?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [form, setForm] = useState<Partial<Movie>>({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastMovieRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) setPage((prev) => prev + 1);
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await getProfile(token);
      setUser(res.data);
      setMovies([]);
      setPage(1);
      setHasMore(true);
    } catch (err: any) {
      toast.error("Failed to fetch user info");
    }
  };

  const loadMovies = async (pageNum: number) => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetchMovies(user.id, pageNum, 2);
      if (res.data.length === 0) setHasMore(false);
      else
        setMovies((prev) =>
          pageNum === 1 ? res.data : [...prev, ...res.data]
        );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);
  useEffect(() => {
    if (user && hasMore) loadMovies(page);
  }, [user, page]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAddOrUpdate = async () => {
    if (!form.title || !form.type) return toast.error("Title & Type required");
    try {
      if (form.id) {
        await updateMovie(form.id, form);
        setMovies((prev) =>
          prev.map((m) => (m.id === form.id ? { ...m, ...form } : m))
        );
        toast.success("Movie updated!");
      } else {
        const res = await addMovie({ ...form, createdById: user!.id });
        setMovies([res.data, ...movies]);
        toast.success("Movie added!");
      }
      setForm({});
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save movie");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      await deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      toast.success("Movie deleted!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete movie");
    }
  };

  return (
    <div className="p-8 w-screen min-h-screen bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Welcome, <span className="text-blue-600">{user?.username}</span>
        </h1>
        <button
          onClick={handleLogout}
          className="bg-[#1a1a1a] px-4 py-2 border border-gray-500 font-bold rounded-2xl hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Movie Form */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1 text-gray-300 font-semibold">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Enter movie title"
          />
        </div>

        {/* Type */}
        <div className="flex flex-col">
          <label htmlFor="type" className="mb-1 text-gray-300 font-semibold">
            Type
          </label>
          <select
            id="type"
            value={form.type || ""}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Select Type</option>
            <option value="Movie">Movie</option>
            <option value="TV Show">TV Show</option>
          </select>
        </div>

        {/* Director */}
        <div className="flex flex-col">
          <label
            htmlFor="director"
            className="mb-1 text-gray-300 font-semibold"
          >
            Director
          </label>
          <input
            id="director"
            type="text"
            value={form.director || ""}
            onChange={(e) => setForm({ ...form, director: e.target.value })}
            className="border p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Enter director name"
          />
        </div>

        {/* Budget */}
        <div className="flex flex-col">
          <label htmlFor="budget" className="mb-1 text-gray-300 font-semibold">
            Budget
          </label>
          <input
            id="budget"
            type="number"
            value={form.budget || ""}
            onChange={(e) =>
              setForm({ ...form, budget: parseFloat(e.target.value) })
            }
            className="border p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Enter budget"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col">
          <label
            htmlFor="location"
            className="mb-1 text-gray-300 font-semibold"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            value={form.location || ""}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="border p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Enter location"
          />
        </div>

        {/* Duration */}
        <div className="flex flex-col">
          <label
            htmlFor="duration"
            className="mb-1 text-gray-300 font-semibold"
          >
            Duration
          </label>
          <input
            id="duration"
            type="text"
            value={form.duration || ""}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="border p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Enter duration"
          />
        </div>

        {/* Year */}
        <div className="flex flex-col">
          <label htmlFor="year" className="mb-1 text-gray-300 font-semibold">
            Year
          </label>
          <input
            id="year"
            type="number"
            value={form.year || ""}
            onChange={(e) =>
              setForm({ ...form, year: parseInt(e.target.value) })
            }
            className="border p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Enter release year"
          />
        </div>

        {/* Poster URL */}
        <div className="flex flex-col">
          <label
            htmlFor="posterUrl"
            className="mb-1 text-gray-300 font-semibold"
          >
            Poster URL
          </label>
          <input
            id="posterUrl"
            type="text"
            value={form.posterUrl || ""}
            onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
            className="border p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Enter poster URL"
          />
        </div>

        {/* Add/Update Button */}
        <div className="flex items-end">
          <button
            onClick={handleAddOrUpdate}
            className="border p-2 rounded bg-[#1a1a1a]  focus:outline-none focus:ring-2  focus:ring-indigo-500 transition w-full"
          >
            {form.id ? "Update Movie" : "Add Movie"}
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-9 gap-2 text-center bg-gray-700 p-2 font-bold sticky top-0 z-10 rounded">
        <div>Poster</div>
        <div>Title</div>
        <div>Type</div>
        <div>Director</div>
        <div>Budget</div>
        <div>Location</div>
        <div>Duration</div>
        <div>Year</div>
        <div>Actions</div>
      </div>

      {/* Movies Grid */}
      <div className="mt-2">
        {movies.map((m, idx) => {
          const isLast = movies.length === idx + 1;
          return (
            <div
              key={m.id}
              ref={isLast ? lastMovieRef : null}
              className="grid grid-cols-9 gap-2 items-center text-center border-b border-gray-600 p-2 hover:bg-gray-800 rounded transition"
            >
              <div className="flex justify-center">
                {m.posterUrl ? (
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="w-20 h-28 object-cover rounded shadow-lg hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-20 h-28 bg-gray-600 flex items-center justify-center rounded">
                    No Image
                  </div>
                )}
              </div>
              <div>{m.title}</div>
              <div>{m.type}</div>
              <div>{m.director || "-"}</div>
              <div>{m.budget || "-"}</div>
              <div>{m.location || "-"}</div>
              <div>{m.duration || "-"}</div>
              <div>{m.year || "-"}</div>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setForm(m)}
                  className="bg-yellow-500 p-2 rounded hover:bg-yellow-600 transition"
                >
                  <FiEdit className="text-white" />
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="bg-red-500 p-2 rounded hover:bg-red-600 transition"
                >
                  <FiTrash2 className="text-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <p className="mt-4 text-center text-gray-400 animate-pulse">
          Loading...
        </p>
      )}
      {!hasMore && (
        <p className="mt-4 text-center text-gray-400 font-medium">
          End of Movies
        </p>
      )}
    </div>
  );
};

export default Dashboard;
