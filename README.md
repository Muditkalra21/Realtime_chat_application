# 💬 ChatterBox — Real-Time Chat Application

A full-stack real-time chat application inspired by WhatsApp/Discord, built with React, Node.js, Socket.IO, PostgreSQL, Prisma, Redis, and Cloudinary.

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Real-time | Socket.IO |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| File Storage | Cloudinary |
| Auth | JWT + bcrypt |

## 📁 Project Structure

```
Realtime_chat_application/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## ⚡ Features

- ✅ JWT Authentication (signup/login)
- ✅ Real-time 1-to-1 messaging via Socket.IO
- ✅ Typing indicators
- ✅ Online/offline user status
- ✅ Image sharing via Cloudinary
- ✅ Dark / Light mode toggle
- ✅ Message timestamps
- ✅ Redis caching for active users
- ✅ Responsive UI

## 🚀 Setup Instructions

### Prerequisites

- Node.js >= 18
- PostgreSQL (running locally or hosted)
- Redis (running locally or hosted)
- Cloudinary account (free tier works)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chatterbox"
JWT_SECRET="your_super_secret_jwt_key"
JWT_EXPIRES_IN="7d"
REDIS_URL="redis://localhost:6379"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLIENT_URL="http://localhost:5173"
PORT=5000
```

### 3. Frontend Environment Variables

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Database Setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📡 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users` | Get all users |
| GET | `/api/messages/:userId` | Get conversation |
| POST | `/api/messages/send/:userId` | Send a message |
| POST | `/api/upload` | Upload image |

## 🔌 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | User comes online |
| `sendMessage` | Client → Server | Send a message |
| `receiveMessage` | Server → Client | Receive a message |
| `typing` | Client → Server | Start typing |
| `stopTyping` | Client → Server | Stop typing |
| `userTyping` | Server → Client | Notify typing |
| `getOnlineUsers` | Server → Client | Broadcast online users |
