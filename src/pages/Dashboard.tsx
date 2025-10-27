import React, { useEffect, useState, useRef, useCallback } from "react";
import { fetchMovies, addMovie, updateMovie, deleteMovie } from "../movies";
import { getProfile } from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiSearch, FiLogOut } from "react-icons/fi"; // Added FiLogOut for the button

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

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

  // Filter + Search logic
  const filteredMovies = movies.filter((m) => {
    const matchesSearch = m.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType ? m.type === filterType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 w-screen min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 border-b border-gray-700 pb-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Welcome, <span className="text-indigo-400">{user?.username}</span>
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 transition duration-200 text-white font-semibold py-2 px-5 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </button>
      </header>

      {/* Movie Form Section */}
      <section className="bg-gray-800 p-6 rounded-xl shadow-2xl mb-10">
        <h2 className="text-2xl font-bold mb-6 text-indigo-400">
          {form.id ? "Edit Movie" : "Add New Movie"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Title */}
          <div className="flex flex-col">
            <label htmlFor="title" className="mb-1 text-gray-400 font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
              placeholder="Enter movie title"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label htmlFor="type" className="mb-1 text-gray-400 font-medium">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={form.type || ""}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none cursor-pointer shadow-inner"
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
              className="mb-1 text-gray-400 font-medium"
            >
              Director
            </label>
            <input
              id="director"
              type="text"
              value={form.director || ""}
              onChange={(e) => setForm({ ...form, director: e.target.value })}
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
              placeholder="Enter director name"
            />
          </div>

          {/* Budget */}
          <div className="flex flex-col">
            <label htmlFor="budget" className="mb-1 text-gray-400 font-medium">
              Budget
            </label>
            <input
              id="budget"
              type="number"
              value={form.budget || ""}
              onChange={(e) =>
                setForm({ ...form, budget: parseFloat(e.target.value) })
              }
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
              placeholder="Enter budget (e.g., 5000000)"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <label
              htmlFor="location"
              className="mb-1 text-gray-400 font-medium"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
              placeholder="Enter location"
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col">
            <label
              htmlFor="duration"
              className="mb-1 text-gray-400 font-medium"
            >
              Duration
            </label>
            <input
              id="duration"
              type="text"
              value={form.duration || ""}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
              placeholder="Enter duration (e.g., 2h 15m)"
            />
          </div>

          {/* Year */}
          <div className="flex flex-col">
            <label htmlFor="year" className="mb-1 text-gray-400 font-medium">
              Year
            </label>
            <input
              id="year"
              type="number"
              value={form.year || ""}
              onChange={(e) =>
                setForm({ ...form, year: parseInt(e.target.value) })
              }
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
              placeholder="Enter release year"
            />
          </div>

          {/* Poster URL */}
          <div className="flex flex-col">
            <label
              htmlFor="posterUrl"
              className="mb-1 text-gray-400 font-medium"
            >
              Poster URL
            </label>
            <input
              id="posterUrl"
              type="text"
              value={form.posterUrl || ""}
              onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
              className="p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
              placeholder="Enter poster URL"
            />
          </div>
        </div>

        {/* Add/Update Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleAddOrUpdate}
            className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition duration-300 transform hover:scale-[1.01] shadow-lg
              ${
                form.id
                  ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400 focus:ring-yellow-500"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
              }
            `}
          >
            {form.id ? (
              <>
                <FiEdit /> <span>Update Movie</span>
              </>
            ) : (
              <>
                <span>Add Movie</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 p-4 bg-gray-800 rounded-xl shadow-xl">
        <div className="flex items-center w-full md:w-1/3 bg-gray-700 rounded-lg px-4 py-3 border border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 transition">
          <FiSearch className="text-indigo-400 mr-3 text-xl" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full outline-none text-white placeholder-gray-400"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-600 bg-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition w-full md:w-auto"
        >
          <option value="">All Types</option>
          <option value="Movie">Movies</option>
          <option value="TV Show">TV Shows</option>
        </select>
      </section>

      {/* Movies Grid Section */}
      <section className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Grid Header */}
        <div className="grid grid-cols-10 gap-2 text-left bg-gray-700 p-4 font-extrabold text-sm uppercase tracking-wider text-indigo-400 sticky top-0 z-10 border-b border-gray-600">
          <div className="col-span-1 text-center">Poster</div>
          <div className="col-span-2 text-center">Title</div>
          <div>Type</div>
          <div>Director</div>
          <div>Budget</div>
          <div>Location</div>
          <div>Duration</div>
          <div>Year</div>
          <div>Actions</div>
        </div>

        {/* Movies Grid Content */}
        <div>
          {filteredMovies.map((m, idx) => {
            const isLast = filteredMovies.length === idx + 1;
            return (
              <div
                key={m.id}
                ref={isLast ? lastMovieRef : null}
                className="grid grid-cols-10 gap-2 items-center text-left border-b border-gray-700 p-4 hover:bg-gray-700/50 transition duration-150 text-sm"
              >
                {/* Poster */}
                <div className="col-span-1 flex justify-center">
                  {m.posterUrl ? (
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-16 h-24 object-cover rounded-md shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-gray-600 flex items-center justify-center text-xs text-gray-400 rounded-md">
                      No Poster
                    </div>
                  )}
                </div>
                {/* Movie Details */}
                <div className="col-span-2 text-center font-semibold text-base">
                  {m.title}
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      m.type === "Movie"
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {m.type}
                  </span>
                </div>
                <div>{m.director || "-"}</div>
                <div>{m.budget ? `$${m.budget.toLocaleString()}` : "-"}</div>
                <div>{m.location || "-"}</div>
                <div>{m.duration || "-"}</div>
                <div>{m.year || "-"}</div>
                {/* Actions */}
                <div className="flex justify-start space-x-2">
                  <button
                    onClick={() => setForm(m)}
                    className="p-2 rounded-full text-gray-900 bg-yellow-400 hover:bg-yellow-500 transition duration-150 transform hover:scale-110 shadow-md"
                    title="Edit"
                  >
                    <FiEdit className="text-lg" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 rounded-full text-white bg-red-600 hover:bg-red-700 transition duration-150 transform hover:scale-110 shadow-md"
                    title="Delete"
                  >
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading and End of List Indicators */}
        <div className="p-4">
          {loading && (
            <p className="text-center text-indigo-400 font-medium animate-pulse text-lg">
              Loading more movies...
            </p>
          )}
          {!hasMore && (
            <p className="text-center text-gray-500 font-medium">
              You've reached the end of your movie collection.
            </p>
          )}
          {filteredMovies.length === 0 && !loading && (
            <p className="text-center text-gray-500 font-medium">
              No movies found matching your criteria.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
