# Ethara.AI - Project Manager

A collaborative project tracking platform with Kanban boards, real-time updates, role-based access, and team management.

Built with **React + Vite + Tailwind CSS** (frontend) and **Express + MongoDB + Socket.io** (backend).

## Features

- **Dashboard** — stat cards, pie chart, and activity feed
- **Projects** — create, manage, and track multiple projects
- **Kanban Board** — drag-and-drop tasks across Todo, In Progress, Done
- **Real-Time Sync** — WebSocket-powered live updates for team collaboration
- **Team Management** — role-based access (admin/member), add/remove members per project
- **Auth** — JWT-based signup/login, first user becomes admin
- **Dark/Light Theme** — toggle between dark and light mode
- **Responsive** — works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 5, Tailwind CSS 4, React Router 7, Recharts, dnd-kit |
| **Backend** | Node.js, Express 4, Mongoose 8, Socket.io 4, JWT, bcryptjs |
| **Database** | MongoDB Atlas |
| **Deployment** | Render (backend), Vercel (frontend) |

## Quick Start

### Prerequisites

- Node.js >= 18
- MongoDB Atlas connection string (or local MongoDB)

### Setup

```bash
# Clone the repo
git clone https://github.com/MusarratNaziaMd/Ektaara.git
cd Ektaara

# Backend
cd server
npm install
cp .env.example .env  # add your MONGODB_URI and JWT_SECRET
npm run seed           # populate demo data
npm run dev            # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
cp .env.example .env  # add VITE_API_URL=http://localhost:5000
npm run dev            # http://localhost:5173
```

### Demo Accounts (seed data)

| Name | Email | Password | Role |
|------|-------|----------|------|
| Nazia | nazia@ethara.ai | password123 | admin |
| Sravys | sravys@ethara.ai | password123 | member |
| Anoohya | anoohya@ethara.ai | password123 | member |
| Krishna | krishna@ethara.ai | password123 | member |
| Anusha | anusha@ethara.ai | password123 | member |

## Deployment

### Render (Backend)

1. Create a Web Service on Render connected to your GitHub repo
2. Set **Root Directory** to `server`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`

### Vercel (Frontend)

1. Import your GitHub repo on Vercel
2. Set **Root Directory** to `client`
3. Add environment variable: `VITE_API_URL` (your Render URL)

## Project Structure

```
Ektaara/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # Auth, Theme, Socket providers
│   │   ├── pages/           # Landing, Login, Signup, Dashboard, Projects, etc.
│   │   └── services/        # API client and auth service
│   ├── vercel.json
│   └── package.json
├── server/                  # Express backend
│   ├── config/              # Database connection
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, role, error handling
│   ├── models/              # Mongoose schemas (User, Project, Task, Activity)
│   ├── routes/              # API routes
│   ├── socket/              # WebSocket setup
│   ├── utils/               # Helpers
│   ├── seed.js              # Demo data seeder
│   ├── server.js            # Entry point
│   ├── Procfile             # Render start command
│   └── package.json
├── vercel.json              # Root Vercel config
└── README.md
```

## License

MIT
