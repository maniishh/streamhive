<div align="center">

```
░██████╗████████╗██████╗░███████╗░█████╗░███╗░░░███╗██╗░░██╗██╗██╗░░░██╗███████╗
██╔════╝╚══██╔══╝██╔══██╗██╔════╝██╔══██╗████╗░████║██║░░██║██║██║░░░██║██╔════╝
╚█████╗░░░░██║░░░██████╔╝█████╗░░███████║██╔████╔██║███████║██║╚██╗░██╔╝█████╗░░
░╚═══██╗░░░██║░░░██╔══██╗██╔══╝░░██╔══██║██║╚██╔╝██║██╔══██║██║░╚████╔╝░██╔══╝░░
██████╔╝░░░██║░░░██║░░██║███████╗██║░░██║██║░╚═╝░██║██║░░██║██║░░╚██╔╝░░███████╗
╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═╝░░░░╚═╝╚═╝░░╚═╝╚═╝░░░╚═╝░░░╚══════╝
```

### *Watch. Create. Connect.*

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com)

<br/>

<img src="https://img.shields.io/github/stars/maniishh/streamhive?style=social" alt="Stars" />
&nbsp;&nbsp;
<img src="https://img.shields.io/github/forks/maniishh/streamhive?style=social" alt="Forks" />
&nbsp;&nbsp;
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs Welcome" />

</div>

---

## ⚡ What is StreamHive?

**StreamHive** is a full-stack video streaming platform — a YouTube-inspired application built from the ground up with a production-grade Node.js/Express REST API and a modern React frontend. It handles everything from JWT-secured authentication to cloud-hosted video delivery, with a complete creator ecosystem built in.

> This is not a tutorial clone. It's a complete, deployable application.

---

## 🗂️ Repository Structure

```
streamhive/
├── backend2/               ← REST API server
│   ├── src/
│   │   ├── controllers/    ← Business logic (user, video, comment, like…)
│   │   ├── models/         ← Mongoose schemas
│   │   ├── routes/         ← Express route definitions
│   │   ├── middlewares/    ← JWT auth, Multer file handling
│   │   ├── utils/          ← ApiError, ApiResponse, asyncHandler, Cloudinary
│   │   ├── db/             ← MongoDB connection
│   │   └── app.js          ← Express app config (CORS, cookies, body parsers)
│   ├── .env.sample
│   └── package.json
│
└── streamhive-frontend/    ← React + Vite client
    ├── src/
    │   ├── api/            ← Axios instance + all API call functions
    │   ├── context/        ← AuthContext (global user state)
    │   ├── components/     ← Navbar, Sidebar, VideoCard, Toast, Layout
    │   └── pages/          ← Home, Login, Register, VideoPage, Dashboard…
    ├── vite.config.js      ← Dev proxy → localhost:8000
    └── package.json
```

---

## ✨ Features

### 👤 User & Auth
- Register with avatar + cover image upload
- Login via email **or** username
- JWT access tokens + refresh token rotation
- Secure HTTP-only cookies
- Update profile, change password, update avatar & cover image

### 🎬 Videos
- Upload video + thumbnail to Cloudinary
- Search & filter by title, description, views, or date
- Paginated video feed
- View count increment on each watch
- Publish / unpublish toggle
- Full CRUD for creators

### 💬 Engagement
- Like / unlike videos, comments, and tweets
- Nested-ready comment system with CRUD
- Subscribe / unsubscribe to channels
- Community tab with short "tweets" per channel

### 📋 Playlists
- Create, rename, and delete playlists
- Add / remove individual videos
- View another user's playlists

### 📊 Creator Dashboard
- Channel stats: total views, subscribers, likes, video count
- Manage all uploaded videos in one table
- Toggle publish status inline
- Delete videos

### 🎨 Frontend
- Dark cinematic UI (amber/gold accent system)
- Fully responsive — mobile, tablet, desktop
- Skeleton loading states & shimmer animations
- Toast notification system
- 2-step registration flow
- Drag-and-drop video upload with live progress bar

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 20 |
| **API Framework** | Express 5 |
| **Database** | MongoDB + Mongoose 8 |
| **Auth** | JWT (access + refresh tokens) + bcrypt |
| **File Handling** | Multer (temp storage) |
| **Cloud Storage** | Cloudinary (videos, thumbnails, avatars) |
| **Frontend** | React 18 + Vite 5 |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios (with interceptors) |
| **Icons** | Lucide React |
| **Fonts** | Syne (headings) + DM Sans (body) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- MongoDB (local or [Atlas](https://cloud.mongodb.com))
- A [Cloudinary](https://cloudinary.com) account (free tier works)

---

### 1. Clone the repo

```bash
git clone https://github.com/maniishh/streamhive.git
cd streamhive
```

---

### 2. Set up the Backend

```bash
cd backend2
npm install
```

Copy the sample env and fill in your values:

```bash
cp .env.sample .env
```

```env
# .env

PORT=8000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/streamhive
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_super_secret_access_key
ACESS_TOKEN_EXPIRE_TIME=1d

REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
REFRESH_TOKEN_EXPIRE_TIME=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
# → API live at http://localhost:8000
```

---

### 3. Set up the Frontend

```bash
# In a new terminal
cd streamhive-frontend
npm install
npm run dev
# → App live at http://localhost:5173
```

The Vite dev server automatically proxies `/api` calls to `http://localhost:8000` — no extra config needed.

---

## 📡 API Reference

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
```http
POST   /users/register          # Register (multipart/form-data: avatar + coverImage)
POST   /users/login             # Login → returns JWT in cookies + body
POST   /users/logout            # Logout (auth required)
POST   /users/refresh-token     # Rotate access token using refresh token
GET    /users/current-user      # Get logged-in user (auth required)
PATCH  /users/update-account    # Update fullName + email
PATCH  /users/avatar            # Upload new avatar
PATCH  /users/cover-image       # Upload new cover image
POST   /users/change-password   # Change password
GET    /users/c/:username       # Public channel profile
GET    /users/history           # Watch history
```

### Videos
```http
GET    /videos                  # Paginated feed (?page, limit, query, sortBy, userId)
POST   /videos                  # Upload video (multipart: videoFile + thumbnail)
GET    /videos/:videoId         # Get video by ID (increments view count)
PATCH  /videos/:videoId         # Update title / description / thumbnail
DELETE /videos/:videoId         # Delete video (owner only)
PATCH  /videos/toggle/publish/:videoId  # Toggle isPublished
```

### Comments
```http
GET    /comments/:videoId       # Get all comments for a video
POST   /comments/:videoId       # Add a comment
PATCH  /comments/c/:commentId   # Edit a comment
DELETE /comments/c/:commentId   # Delete a comment
```

### Likes
```http
POST   /likes/toggle/v/:videoId    # Like / unlike a video
POST   /likes/toggle/c/:commentId  # Like / unlike a comment
POST   /likes/toggle/t/:tweetId    # Like / unlike a tweet
GET    /likes/videos               # Get all liked videos
```

### Subscriptions
```http
POST   /subscriptions/c/:channelId    # Subscribe / unsubscribe
GET    /subscriptions/c/:channelId    # Get channels a user subscribes to
GET    /subscriptions/u/:subscriberId # Get subscribers of a channel
```

### Playlists
```http
POST   /playlists                       # Create playlist
GET    /playlists/:playlistId           # Get playlist with videos
PATCH  /playlists/:playlistId           # Update name / description
DELETE /playlists/:playlistId           # Delete playlist
PATCH  /playlists/add/:videoId/:playlistId     # Add video
PATCH  /playlists/remove/:videoId/:playlistId  # Remove video
GET    /playlists/user/:userId          # Get all playlists by user
```

### Tweets (Community posts)
```http
POST   /tweets                  # Create tweet
GET    /tweets/user/:userId     # Get user's tweets
PATCH  /tweets/:tweetId         # Edit tweet
DELETE /tweets/:tweetId         # Delete tweet
```

### Dashboard
```http
GET    /dashboard/stats         # totalViews, totalSubscribers, totalLikes, totalVideos
GET    /dashboard/videos        # All videos uploaded by current user
```

---

## 🧩 Data Models

<details>
<summary><strong>User</strong></summary>

```js
{
  username:     String (unique, lowercase, indexed),
  email:        String (unique),
  fullname:     String,
  avatar:       String (Cloudinary URL),
  coverImage:   String (Cloudinary URL),
  watchHistory: [ObjectId → Video],
  password:     String (bcrypt hashed),
  refreshToken: String
}
```
</details>

<details>
<summary><strong>Video</strong></summary>

```js
{
  videoFile:   String (Cloudinary URL),
  thumbnail:   String (Cloudinary URL),
  title:       String,
  description: String,
  duration:    Number (seconds),
  views:       Number,
  isPublished: Boolean,
  owner:       ObjectId → User
}
```
</details>

<details>
<summary><strong>Comment</strong></summary>

```js
{
  content: String,
  video:   ObjectId → Video,
  owner:   ObjectId → User
}
```
</details>

<details>
<summary><strong>Like</strong></summary>

```js
{
  video:   ObjectId → Video  (optional),
  comment: ObjectId → Comment (optional),
  tweet:   ObjectId → Tweet  (optional),
  likedBy: ObjectId → User
}
```
</details>

<details>
<summary><strong>Subscription</strong></summary>

```js
{
  subscriber: ObjectId → User,  // the person who subscribes
  channel:    ObjectId → User   // the person being subscribed to
}
```
</details>

<details>
<summary><strong>Playlist</strong></summary>

```js
{
  name:        String,
  description: String,
  videos:      [ObjectId → Video],
  owner:       ObjectId → User
}
```
</details>

<details>
<summary><strong>Tweet</strong></summary>

```js
{
  content: String,
  owner:   ObjectId → User
}
```
</details>

---

## 🔐 Authentication Flow

```
┌─────────────┐        POST /users/login         ┌─────────────────┐
│   Client    │ ──────────────────────────────► │   Express API   │
│             │ ◄── accessToken (1d) + cookie ── │                 │
│             │ ◄── refreshToken (10d) + cookie ─│                 │
└─────────────┘                                  └─────────────────┘
       │
       │  Every request:
       │  Authorization: Bearer <accessToken>
       │                        │
       │  On 401 (expired):     │
       │  POST /users/refresh-token ──► new accessToken
       └──────────────────────────────────────────────►
```

Handled automatically by the Axios interceptor in `src/api/index.js`.

---

## 📐 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         React Frontend                           │
│  Pages → API Layer (Axios) → Vite Proxy → Express REST API       │
└──────────────────────────────────┬───────────────────────────────┘
                                   │ /api/v1/*
┌──────────────────────────────────▼───────────────────────────────┐
│                       Express Application                        │
│                                                                  │
│   Routes ──► Middlewares (JWT verify, Multer) ──► Controllers    │
│                                                        │         │
│                                 ┌──────────────────────┘         │
│                                 ▼                                │
│              ┌──────────────────────────────────┐               │
│              │         Mongoose Models           │               │
│              │  User · Video · Comment · Like    │               │
│              │  Subscription · Playlist · Tweet  │               │
│              └──────────────┬───────────────────┘               │
│                             ▼                                    │
│                        MongoDB Atlas                             │
│                                                                  │
│              ┌──────────────────────────────────┐               │
│              │         Cloudinary CDN            │               │
│              │  videos/ · thumbnails/ · avatars/ │               │
│              └──────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📸 Pages Overview

| Page | Route | Description |
|---|---|---|
| Home Feed | `/` | Paginated video grid with sort (Latest / Popular / A–Z) |
| Login | `/login` | Email or username login |
| Register | `/register` | 2-step signup with avatar + cover upload |
| Watch | `/watch/:id` | Video player + comments + like + related videos |
| Channel | `/channel/:username` | Videos / Playlists / Community tabs |
| Upload | `/upload` | Drag-and-drop upload with progress bar |
| Dashboard | `/dashboard` | Creator analytics + video management table |
| Playlists | `/playlists` | Create and manage playlists |
| Liked | `/liked` | All liked videos |
| History | `/history` | Watch history |
| Settings | `/settings` | Profile / Password / Images tabs |

---

## 🗺️ Roadmap

- [x] Full auth system (register, login, refresh, logout)
- [x] Video upload + cloud storage
- [x] Comments CRUD
- [x] Likes on videos, comments, tweets
- [x] Subscriptions
- [x] Playlists
- [x] Creator dashboard with analytics
- [x] Responsive React frontend
- [ ] Real-time notifications (WebSockets / Socket.io)
- [ ] Video recommendations engine
- [ ] Chapters / timestamps in videos
- [ ] Live streaming support
- [ ] Mobile app (React Native)
- [ ] Unit & integration tests (Jest + Supertest)

---

## 🤝 Contributing

Contributions are very welcome. Here's how:

```bash
# 1. Fork the project
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m 'feat: add amazing feature'

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

Built with ☕ and too many late nights by **[Manish](https://github.com/maniishh)**

<br/>

*If this project helped you, a ⭐ on the repo would mean the world.*

</div>
