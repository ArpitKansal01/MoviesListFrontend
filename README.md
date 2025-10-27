# 🎬 Movies Dashboard

A full-stack **Movies Management Dashboard** built using **React + TypeScript + Express + Prisma + MySQL**.  
Users can **sign up, log in, and manage their own list of movies or TV shows** — including details like title, type, director, budget, and more — all with a sleek movie-themed UI.

## 🚀 Features

### 🎥 Movie Management

- Add, edit, and delete movies with real-time updates.
- Infinite scrolling to load more movies dynamically.
- Poster image preview for each movie.
- Grid-based layout inspired by modern movie databases.

### 👤 Authentication

- Secure signup and login using JWT.
- Protected routes (only logged-in users can access the dashboard).

### 🧑‍💻 User Dashboard

- Users can add movies and update movie details
- Each user sees only their movies.
- Logout functionality to clear sessions securely.

### 💅 UI & UX

- Fully responsive and dark-themed interface.
- Built with **Tailwind CSS** for fast and modern styling.
- Toast notifications for every action (add, update, delete, error, etc).

## 🧰 Tech Stack

### Frontend

- ⚛️ **React** (with TypeScript)
- 🎨 **Tailwind CSS**
- 🔔 **React Hot Toast**
- 🧭 **React Router**

### Backend

- 🚀 **Express.js**
- 🧠 **Prisma ORM**
- 🗄️ **PostgreSQL**
- 🔒 **JWT Authentication**
- ⚙️ **Zod validation**

## 📦 Folder Structure

```
├── backend/
│ ├── prisma/
│ │ └── schema.prisma
│ ├── controllers/
│ ├── routes/
│ ├── server.ts
│ ├── package.json
│ └── ...
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ │ ├── Dashboard.tsx
│ │ │ ├── Login.tsx
│ │ │ └── Signup.tsx
│ │ ├── movies.ts
│ │ ├── api.ts
│ │ └── main.tsx
│ ├── tailwind.config.cjs
│ ├── package.json
│ ├── README.md
│ └── ...
```

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/movies-dashboard.git
cd movies-dashboard
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

#### Configure .env file:

```bash
DATABASE_URL="mysql://your_username:your_password@localhost:3306/your_dbname"
JWT_SECRET="your_jwt_secret_key"
PORT=5000
```

#### Run Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
Start Backend Server
```

### 3️⃣ Setup Frontend

From Home Directory

```bash
cd frontend
npm install
npm run dev
```

Frontend runs by default on 👉 http://localhost:5173

# 🧩 API Endpoints

| Method | Endpoint        | Description              | Auth Required |
| ------ | --------------- | ------------------------ | ------------- |
| POST   | /api/signup     | Create a new user        | ❌            |
| POST   | /api/login      | Login and get JWT token  | ❌            |
| GET    | /api/profile    | Get logged-in user info  | ✅            |
| GET    | /api/movies     | Fetch movies (paginated) | ✅            |
| POST   | /api/movies     | Add a new movie          | ✅            |
| PUT    | /api/movies/:id | Update movie details     | ✅            |
| DELETE | /api/movies/:id | Delete a movie           | ✅            |

# 🧠 Pagination Logic

- Movies are fetched 2 at a time.
- Infinite scrolling automatically loads more when reaching the bottom.

# 🖼️ Preview

🎨 A modern, dark-themed dashboard designed for an immersive movie management experience.

### Login Page

![LoginPage](./output/login.png)

---

### Signup Page

![SignUpPAge](./output/signup.png)

---

### Dashboard Page

![DashboardPage](./output/dashboard.png)

# 🧑‍💼 Author

Arpit Kansal \
kansalarpit06@gmail.com
