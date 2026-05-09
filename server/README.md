# Ethara API

Express + MongoDB + Socket.io backend for Ethara.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start dev server with nodemon |
| `npm run seed` | Seed database with demo data |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `CLIENT_URL` | Frontend URL for CORS |
| `PORT` | Server port (default: 5000) |

## API Endpoints

- `GET /api/health` — Health check
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user
- `PUT /api/auth/profile` — Update profile
- `GET /api/projects` — List projects
- `POST /api/projects` — Create project (admin)
- `GET /api/projects/:id` — Project detail
- `PUT /api/projects/:id` — Update project (admin)
- `DELETE /api/projects/:id` — Delete project (admin)
- `POST /api/projects/:id/members` — Add member (admin)
- `DELETE /api/projects/:id/members/:userId` — Remove member (admin)
- `GET /api/tasks` — List tasks
- `POST /api/tasks` — Create task
- `PUT /api/tasks/reorder` — Reorder tasks
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task (admin)
- `GET /api/dashboard/stats` — Dashboard stats
- `GET /api/activity` — Activity feed
