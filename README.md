# 🎓 Placement Portal Management System

A full-stack web application connecting students with top companies through a modern placement management platform.

![Tech Stack](https://img.shields.io/badge/Frontend-React-blue?style=flat-square&logo=react)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-green?style=flat-square&logo=fastapi)
![Tech Stack](https://img.shields.io/badge/Database-SQLite-orange?style=flat-square&logo=sqlite)
![Tech Stack](https://img.shields.io/badge/Auth-JWT-red?style=flat-square)

---

## 📁 Project Structure

```
placement-portal/
├── frontend/                  # React 18 app
│   ├── src/
│   │   ├── api/               # Axios instance with JWT interceptors
│   │   ├── components/        # Navbar, ProtectedRoute
│   │   ├── context/           # AuthContext (login/logout/user state)
│   │   └── pages/             # Home, Login, Register, StudentDashboard, AdminDashboard
│   ├── public/
│   ├── .env.example
│   ├── netlify.toml
│   └── package.json
├── backend/                   # FastAPI app
│   ├── routes/
│   │   ├── auth_routes.py     # /auth/register, /auth/login
│   │   ├── student.py         # /jobs, /applications/*
│   │   └── admin.py           # /admin/jobs, /admin/applications, /admin/students
│   ├── main.py                # App entrypoint + CORS + admin seeding
│   ├── models.py              # SQLAlchemy models
│   ├── schemas.py             # Pydantic schemas
│   ├── auth.py                # JWT + bcrypt utils
│   ├── database.py            # SQLite engine + session
│   ├── .env.example
│   └── requirements.txt
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **Python** 3.9+
- **pip**

---

### 🔧 Backend Setup (FastAPI)

```bash
# 1. Navigate to backend
cd placement-portal/backend

# 2. Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy env file
copy .env.example .env        # Windows
cp .env.example .env          # macOS/Linux

# 5. Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at: **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

---

### 🎨 Frontend Setup (React)

```bash
# 1. Navigate to frontend
cd placement-portal/frontend

# 2. Install dependencies
npm install

# 3. Copy env file
copy .env.example .env        # Windows
cp .env.example .env          # macOS/Linux

# 4. Start development server
npm start
```

The app will be available at: **http://localhost:3000**

---

## 🔐 Default Credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@portal.com   | admin123  |

> Admin is seeded automatically on first backend startup.

---

## 🌍 Environment Variables

### Backend (`backend/.env`)
```env
SECRET_KEY=your_super_secret_key_here
DATABASE_URL=sqlite:///./placement_portal.db
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints

### 🔑 Authentication
| Method | Endpoint          | Description            | Auth |
|--------|-------------------|------------------------|------|
| POST   | `/auth/register`  | Student registration   | ❌   |
| POST   | `/auth/login`     | Login (returns JWT)    | ❌   |

### 👨‍🎓 Student Routes
| Method | Endpoint               | Description                  | Auth    |
|--------|------------------------|------------------------------|---------|
| GET    | `/jobs`                | List all active jobs         | Student |
| GET    | `/jobs/{id}`           | Get job details              | Student |
| POST   | `/applications/{id}`   | Apply to a job               | Student |
| GET    | `/applications/my`     | View own applications        | Student |

### 🛡️ Admin Routes
| Method | Endpoint                       | Description                      | Auth  |
|--------|--------------------------------|----------------------------------|-------|
| GET    | `/admin/jobs`                  | All jobs (inc. inactive)         | Admin |
| POST   | `/admin/jobs`                  | Create new job                   | Admin |
| PUT    | `/admin/jobs/{id}`             | Update job                       | Admin |
| DELETE | `/admin/jobs/{id}`             | Deactivate job                   | Admin |
| GET    | `/admin/applications`          | All applications                 | Admin |
| PATCH  | `/admin/applications/{id}`     | Update application status        | Admin |
| GET    | `/admin/students`              | All registered students          | Admin |

---

## 🗄️ Data Models

### User
| Field           | Type    | Description              |
|-----------------|---------|--------------------------|
| id              | int     | Primary key              |
| name            | string  | Full name                |
| email           | string  | Unique email             |
| hashed_password | string  | bcrypt hashed            |
| role            | string  | `student` or `admin`     |
| college         | string  | College name             |
| branch          | string  | Degree branch            |
| cgpa            | float   | CGPA (0–10)              |

### Job
| Field       | Type    | Description              |
|-------------|---------|--------------------------|
| id          | int     | Primary key              |
| title       | string  | Job title                |
| company     | string  | Company name             |
| description | text    | Job description          |
| location    | string  | Location                 |
| salary      | string  | CTC / salary range       |
| deadline    | string  | Application deadline     |
| skills      | string  | Comma-separated skills   |
| is_active   | bool    | Whether job is active    |

### Application
| Field       | Type     | Description                          |
|-------------|----------|--------------------------------------|
| id          | int      | Primary key                          |
| student_id  | int      | FK → User                           |
| job_id      | int      | FK → Job                            |
| status      | string   | Pending / Shortlisted / Rejected / Selected |
| applied_at  | datetime | Timestamp                            |

---

## 🚢 Deployment

### Frontend → Netlify

1. Push code to GitHub
2. Connect the repo in Netlify
3. Set **Base directory**: `frontend`
4. Set **Build command**: `npm run build`
5. Set **Publish directory**: `frontend/build`
6. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.com`

### Backend → Render / Railway

1. Connect GitHub repo
2. Set **Root directory**: `backend`
3. Set **Start command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from `.env.example`

---

## ✨ Features

- 🔐 **JWT Authentication** with bcrypt password hashing
- 👨‍🎓 **Student Portal**: Browse & filter jobs, one-click apply, track application status
- 🛡️ **Admin Panel**: Post/edit/delete jobs, manage all applications, view students
- 🎨 **Modern Dark UI**: Glassmorphism, gradient accents, responsive design
- 🔔 **Toast Notifications**: Real-time success/error feedback
- 📱 **Responsive**: Works on mobile and desktop
- 🚀 **Netlify Ready**: SPA redirect configured

---

## 🛠️ Tech Stack

| Layer      | Technology             |
|------------|------------------------|
| Frontend   | React 18, React Router v6 |
| Styling    | Custom CSS (dark theme, glassmorphism) |
| HTTP Client| Axios with JWT interceptors |
| Backend    | Python 3.9+, FastAPI   |
| ORM        | SQLAlchemy 2.0         |
| Database   | SQLite                 |
| Auth       | JWT (python-jose), bcrypt (passlib) |
| Deployment | Netlify (FE), Render/Railway (BE) |
