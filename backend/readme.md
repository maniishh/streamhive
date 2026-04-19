# 🎥 StreamHive (Backend)

A scalable backend system for a modern video streaming platform. It provides APIs for user management, video handling, engagement features, and content discovery — designed with production-style architecture and best practices.

---

## 🚀 Core Features

* 🔐 **Authentication & Authorization** (JWT-based)
* 👤 **User & Channel Management**
* 📤 **Video Upload & Processing** (Cloud storage integration)
* ▶️ **Video Streaming Support (URL-based delivery)**
* 👍 **Like / 👎 Dislike System**
* 💬 **Comments & Threading**
* 📊 **View Count Tracking & Metrics**
* 🔍 **Search & Filtering APIs**
* 🧩 **Modular MVC Architecture**

---

## 🧱 Architecture Overview

* **Layered Design**: Routes → Controllers → Services → Models
* **RESTful APIs** with clear resource naming
* **Stateless Auth** using JWT
* **Scalable Storage** using cloud media service
* **Error Handling Middleware** for consistent responses

---

## 🛠️ Tech Stack

**Backend:**

* Node.js
* Express.js

**Database:**

* MongoDB (Mongoose ODM)

**Auth & Security:**

* JSON Web Tokens (JWT)
* Bcrypt (password hashing)

**Media Storage:**

* Cloudinary (or similar)

---

## 📂 Project Structure

```
streamhive/
│── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── utils/
│   └── config/
│── .env
│── package.json
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/maniishh/streamhive.git
cd streamhive
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Environment variables

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLOUDINARY_URL=your_cloudinary_config
```

### 4️⃣ Run the server

```bash
npm run dev
```

---

## 📡 API Highlights

* `POST /api/auth/register` – Register user
* `POST /api/auth/login` – Login user
* `POST /api/videos` – Upload video
* `GET /api/videos/:id` – Fetch video
* `POST /api/videos/:id/like` – Like video
* `POST /api/comments` – Add comment

### 📥 Sample Requests & Responses

#### Register User

```json
POST /api/auth/register
{
  "username": "manish",
  "email": "manish@email.com",
  "password": "123456"
}
```

```json
Response:
{
  "success": true,
  "token": "jwt_token_here"
}
```

#### Upload Video

```json
POST /api/videos
Headers: Authorization: Bearer <token>
Body: multipart/form-data
```

```json
Response:
{
  "success": true,
  "videoId": "abc123"
}
```

---

## 🧠 System Design (High-Level)

```
Client → API Gateway → Express Server
                ↓
        Controllers Layer
                ↓
        Services Layer
                ↓
        Database (MongoDB)
                ↓
        Cloud Storage (Videos)
```

* Client interacts via REST APIs
* Backend handles auth, logic, and data flow
* Media stored externally for scalability

---

---

## 📌 Design Decisions

* Used **JWT** for stateless scalability
* Followed **MVC pattern** for maintainability
* Separated **business logic (services)** from controllers
* Integrated **cloud storage** to avoid local file bottlenecks

---
## 🧪 Testing (Planned)

- Unit testing using Jest
- API testing with Postman

---

## 🔮 Future Improvements

* 🔴 Real-time notifications (WebSockets)
* 🤖 Recommendation system
* 📈 Analytics dashboard
* 🧪 Unit & integration testing

---

## 🤝 Contributing

Contributions are welcome. Fork the repo and create a PR.

---

## 👨‍💻 Author

**Manish**

---

⭐ If you find this useful, consider starring the repo!
