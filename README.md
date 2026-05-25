# 🚀 ProjectX - Enterprise Team Collaboration Platform

> A professional-grade, full-stack MERN application for seamless project management, real-time activity tracking, and intelligent team collaboration.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Design](#-system-structure)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment-on-render)
- [Screenshots](#-screenshots)

---

## 🎯 Overview

**ProjectX** is a high-performance collaboration platform designed to streamline team workflows. Inspired by industry leaders like Trello and Jira, it offers a rich, interactive experience for managing boards, lists, and tasks. Built with the **MERN stack**, it features a real-time activity engine, global theme management, and enterprise-level security.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | JWT-based login/register with Bcrypt password hashing |
| 📋 **Dynamic Boards** | Create and manage horizontal Trello-style boards with drag-and-drop feel |
| ⚡ **Real-time Activity** | Live tracking of all workspace actions via Socket.io |
| 🌙 **Adaptive Theme** | One-click toggle between **Light** and **Dark** modes (persisted in local storage) |
| 🤝 **Member Management** | Invite users to your workspace and manage roles within a unified interface |
| 🚀 **Workspace Settings** | Toggle AI capabilities, visibility policies, and restriction levels |
| 📤 **Data Export** | Export your project data in multiple formats: **JSON, CSV, PDF, Text** |
| 👤 **Full Profile Suite** | Manage profiles, cover photos, password changes, and 2FA security |
| 🔔 **Notification System** | Interactive dropdown for recent activity and board updates |
| 📱 **Fully Responsive** | Optimized for desktop, tablet, and mobile workflows with a slick sidebar |

---

## 🛠️ Tech Stack

---

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_React-F56565?style=for-the-badge&logo=lucide&logoColor=white)

---

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

---

### Security & Tools

![Bcrypt](https://img.shields.io/badge/Bcrypt.js-FF6B6B?style=for-the-badge&logo=lock&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-FFA500?style=for-the-badge&logo=security&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

---

## 🤖 System Structure

**ProjectX** is architected for scalability, utilizing the **MERN** stack for high performance and **Tailwind CSS 4** for a premium, low-latency UI.

| Component | Responsibility |
|---|---|
| ✅ **Auth Context** | Manages user sessions, registration, and secure logout |
| ✅ **Theme Context** | Handles global Light/Dark mode state and transitions |
| ✅ **UI Context** | Centralized confirmation modals and interactive global elements |
| ✅ **Activity Logger** | Backend utility for tracking workspace-wide interactions |
| ✅ **Socket.io Engine** | Real-time event broadcasting for live updates |

---

## 📁 Project Structure

```text
Project_Management/
├── backend/                # Node.js & Express API
│   ├── config/             # DB Connection Config
│   ├── controllers/        # Route Logic (Auth, Projects, Tasks, Activity)
│   ├── models/             # Mongoose Schemas (User, Project, Task, Activity)
│   ├── routes/             # API Endpoints
│   ├── utils/              # Global Loggers & Helpers
│   └── server.js           # Entry point
├── frontend/               # React 19 SPA (Vite)
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, Modals, Layouts
│   │   ├── pages/          # Dashboard, ProjectBoard, Profile, Activity
│   │   ├── context/        # Auth, Theme, and UI Global States
│   │   ├── services/       # Axios API Instance
│   │   └── App.jsx         # Routes & Global Providers
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (free tier)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/khushigami26/CodeAlpha_Tasks.git
cd CodeAlpha_Tasks/Project_Management
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```bash
PORT=5000
MONGODB_URI="your_mongodb_atlas_url"
JWT_SECRET="your_secure_random_string"
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Start the frontend server:
```bash
npm run dev
```

Visit: **http://localhost:5173** (Vite default port)

---

## 🔐 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas Cluster connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for signing authentication tokens | ✅ Yes |
| `PORT` | Backend server port (defaults to 5000) | ❌ Optional |

---

## ☁️ Deployment on Render

1. Push your repository to GitHub.
2. Log in to [Render](https://render.com).
3. Create a **New Static Site** for the `frontend/` (build command: `npm run build`, publish dir: `dist`).
4. Create a **New Web Service** for the `backend/`.
5. Configuration:
   - **Root Directory**: `Project_Management/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add Environment Variables in the Render dashboard (Settings -> Environment).

---

## 📸 Screenshots

<table>
  <tr>
    <td><img src="frontend/screenshots/ss1.jpg" alt="Screenshot 1" width="100%"/></td>
    <td><img src="frontend/screenshots/ss2.jpg" alt="Screenshot 2" width="100%"/></td>
  </tr>
  <tr>
    <td><img src="frontend/screenshots/ss3.jpg" alt="Screenshot 3" width="100%"/></td>
    <td><img src="frontend/screenshots/ss4.jpg" alt="Screenshot 4" width="100%"/></td>
  </tr>
  <tr>
    <td><img src="frontend/screenshots/ss5.jpg" alt="Screenshot 5" width="100%"/></td>
    <td><img src="frontend/screenshots/ss6.jpg" alt="Screenshot 6" width="100%"/></td>
  </tr>
  <tr>
    <td><img src="frontend/screenshots/ss7.jpg" alt="Screenshot 7" width="100%"/></td>
    <td><img src="frontend/screenshots/ss8.jpg" alt="Screenshot 8" width="100%"/></td>
  </tr>
</table>

---

## 👩‍💻 Author

**Khushi** — [@khushigami26](https://github.com/khushigami26)

---

<p align="center">🚀 Built using MERN Stack & Tailwind CSS 4</p>
