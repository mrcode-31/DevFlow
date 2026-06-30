# 🚀 DevFlow - Enterprise Project Management Platform

DevFlow is a **full-stack, enterprise-grade project management platform inspired by Jira**, designed to help engineering and product teams collaborate efficiently through **real-time task management, role-based permissions, and actionable analytics**.

Built with modern web technologies, DevFlow provides a scalable and collaborative environment for managing projects, sprints, and workflows.

---

## ✨ Features

### 📋 Real-Time Kanban Board

* Drag-and-drop task management powered by **@dnd-kit**.
* Real-time synchronization using **Socket.IO**.
* Instant updates across all connected clients without page refreshes.

### 🔐 Role-Based Access Control (RBAC)

Supports hierarchical permissions:

| Role            | Permissions                               |
| --------------- | ----------------------------------------- |
| Viewer          | Read-only access to projects and tasks    |
| Developer       | Update task statuses and assignments      |
| Project Manager | Manage tasks, sprints, and team workflows |
| Admin           | Full project administration               |
| Owner           | Complete workspace control                |

---

### 🏢 Multi-Tenant Architecture

Organize work efficiently through a hierarchical structure:

```text
Workspace
   └── Projects
         └── Sprints
               └── Tasks
```

---

### 📊 Dashboard Analytics

Gain insights into project progress through:

* Task distribution by status
* Seven-day completion trends
* Team productivity metrics
* MongoDB aggregation-based analytics

---

### 📝 Task History & Audit Logs

Every important action is tracked:

* Task creation
* Status changes
* Assignee updates
* Project activities

Providing complete audit trails for better transparency and accountability.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* @dnd-kit
* Recharts
* Lucide Icons
* Axios

### Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication

### Database

* MongoDB
* Mongoose

### Development Tools

* npm
* Git & GitHub

---

## 🏗️ Architecture

```text
Client (React)
       ↓
REST APIs + WebSockets
       ↓
Node.js + Express Server
       ↓
MongoDB Database
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed:

* Node.js (v18+ recommended)
* MongoDB
* npm

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mrcode-31/devhub.git
cd devhub
```

### 2. Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd ../client
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/devhub
JWT_SECRET=your_jwt_secret_key
```

---

## 🌱 Seed the Database (Optional)

```bash
cd server
npm run seed
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd server
npm run dev
```

Runs on:

```text
http://localhost:5000
```

### Start Frontend

```bash
cd client
npm run dev
```

Runs on:

```text
http://localhost:5173
```

---

## 🔒 Security Features

* JWT-based authentication
* Protected API routes
* Role-based authorization
* Secure password hashing
* Server-side permission validation

---

## 📈 Scalability Considerations

### Optimized Database Queries

Dashboard metrics leverage **MongoDB Aggregation Pipelines** to reduce server load and improve performance.

### Stateless Authentication

JWT-based authentication enables horizontal scaling without maintaining server sessions.

### Real-Time Communication

Socket.IO ensures low-latency synchronization between connected clients.

### Modular Architecture

The codebase follows a modular structure, making it easy to extend and maintain.

---

## 📂 Project Structure

```text
devhub
├── client
│   ├── src
│   └── public
├── server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── services
│   └── utils
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes

```bash
git commit -m "Add your feature"
```

4. Push to your branch

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request 🚀

---

## 🌟 Future Enhancements

* Email notifications
* Task due-date reminders
* Advanced analytics dashboard
* File attachments
* Search and filtering
* Pagination support
* GitHub integration
* Dark mode

---
