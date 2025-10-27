import React, { useEffect, useState, useRef, useCallback } from "react";
import { fetchMovies, addMovie, updateMovie, deleteMovie } from "../movies";
import { getProfile } from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiSearch, FiLogOut } from "react-icons/fi";

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
    } catch {
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

  const filteredMovies = movies.filter((m) => {
    const matchesSearch = m.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType ? m.type === filterType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-screen min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10 border-b border-gray-700 pb-4 gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center sm:text-left">
          Welcome,{" "}
          <span className="text-indigo-400">{user?.username || "User"}</span>
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 transition duration-200 text-white font-semibold py-2 px-5 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto"
        >
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </button>
      </header>

      {/* Movie Form Section */}
      <section className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl mb-8 sm:mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-400 text-center sm:text-left">
          {form.id ? "Edit Movie" : "Add New Movie"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Reusing inputs as is */}
          {[
            { id: "title", label: "Title*", type: "text", key: "title" },
            { id: "type", label: "Type*", type: "select", key: "type" },
            {
              id: "director",
              label: "Director",
              type: "text",
              key: "director",
            },
            { id: "budget", label: "Budget", type: "number", key: "budget" },
            {
              id: "location",
              label: "Location",
              type: "text",
              key: "location",
            },
            {
              id: "duration",
              label: "Duration",
              type: "text",
              key: "duration",
            },
            { id: "year", label: "Year", type: "number", key: "year" },
            {
              id: "posterUrl",
              label: "Poster URL",
              type: "text",
              key: "posterUrl",
            },
          ].map((field) => (
            <div key={field.id} className="flex flex-col">
              <label
                htmlFor={field.id}
                className="mb-1 text-gray-400 font-medium"
              >
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  id={field.id}
                  value={form.type || ""}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="">Select Type</option>
                  <option value="Movie">Movie</option>
                  <option value="TV Show">TV Show</option>
                </select>
              ) : (
                <input
                  id={field.id}
                  type={field.type}
                  value={form[field.key as keyof Movie] || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [field.key]:
                        field.type === "number"
                          ? parseFloat(e.target.value)
                          : e.target.value,
                    })
                  }
                  className="p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleAddOrUpdate}
            className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition duration-300
              ${
                form.id
                  ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
          >
            {form.id ? (
              <>
                <FiEdit /> <span>Update Movie</span>
              </>
            ) : (
              <span>Add Movie</span>
            )}
          </button>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 p-4 bg-gray-800 rounded-xl shadow-xl">
        <div className="flex items-center w-full md:w-1/3 bg-gray-700 rounded-lg px-4 py-3 border border-gray-600">
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
          className="border border-gray-600 bg-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
        >
          <option value="">All Types</option>
          <option value="Movie">Movies</option>
          <option value="TV Show">TV Shows</option>
        </select>
      </section>

      {/* Movies Section */}
      <section className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-10 gap-2 text-left bg-gray-700 p-4 font-extrabold text-sm uppercase tracking-wider text-indigo-400 sticky top-0 z-10 border-b border-gray-600">
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

        {/* Movie Cards for mobile/tablet */}
        <div className="lg:hidden flex flex-col gap-4 p-4">
          {filteredMovies.map((m, idx) => {
            const isLast = filteredMovies.length === idx + 1;
            return (
              <div
                key={m.id}
                ref={isLast ? lastMovieRef : null}
                className="bg-gray-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-md"
              >
                <img
                  src={m.posterUrl || ""}
                  alt={m.title}
                  className="w-24 h-36 object-cover rounded-lg self-center sm:self-start"
                />
                <div className="flex-1 space-y-1">
                  <h3 className="text-xl font-semibold">{m.title}</h3>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Type:</span> {m.type}
                  </p>
                  {m.director && (
                    <p className="text-sm text-gray-400">
                      <span className="font-medium">Director:</span>{" "}
                      {m.director}
                    </p>
                  )}
                  {m.year && (
                    <p className="text-sm text-gray-400">
                      <span className="font-medium">Year:</span> {m.year}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setForm(m)}
                      className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table Rows */}
        <div className="hidden lg:block">
          {filteredMovies.map((m, idx) => {
            const isLast = filteredMovies.length === idx + 1;
            return (
              <div
                key={m.id}
                ref={isLast ? lastMovieRef : null}
                className="grid grid-cols-10 gap-2 items-center border-b border-gray-700 p-4 hover:bg-gray-700/50 transition duration-150 text-sm"
              >
                <div className="col-span-1 flex justify-center">
                  {m.posterUrl ? (
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-16 h-24 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-gray-600 flex items-center justify-center text-xs text-gray-400 rounded-md">
                      No Poster
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-center font-semibold text-base">
                  {m.title}
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      m.type === "Movie" ? "bg-green-600" : "bg-blue-600"
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
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm(m)}
                    className="p-2 rounded-full bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 text-center">
          {loading && (
            <p className="text-indigo-400 font-medium animate-pulse text-lg">
              Loading more movies...
            </p>
          )}
          {!hasMore && (
            <p className="text-gray-500 font-medium">
              You've reached the end of your movie collection.
            </p>
          )}
          {filteredMovies.length === 0 && !loading && (
            <p className="text-gray-500 font-medium">
              No movies found matching your criteria.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
