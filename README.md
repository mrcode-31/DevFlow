# DevFlow - Project Management Platform

DevHub is a full-stack, enterprise-grade project management application inspired by Jira. It is designed to help engineering and marketing teams collaborate seamlessly with role-based permissions, real-time Kanban boards, and insightful dashboard analytics.

## 🚀 Features

- **Real-Time Kanban Board:** Built with `@dnd-kit` and WebSockets (Socket.IO). When a task is moved to a different column, the board instantly synchronizes across all connected clients without needing a page refresh.
- **Role-Based Access Control (RBAC):** Supports hierarchical permissions (Owner, Admin, Project Manager, Developer, Viewer). Viewers can observe task progress, while Developers and Managers can edit assignments and modify statuses.
- **Multi-Tenant Architecture:** Organize work through nested relationships: Workspaces -> Projects -> Sprints -> Tasks.
- **Dashboard Analytics:** Visualizes real-time task distribution and 7-day completion trends using MongoDB Aggregation Pipelines to process data efficiently.
- **Task History Tracking:** Every status change and reassignment is logged historically in the database for complete audit trails.

## 💻 Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide Icons, Recharts, @dnd-kit
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MongoDB & Mongoose
- **Authentication:** Custom JWT-based authentication
- **Tooling:** Vite, npm

## 🛠️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mrcode-31/devhub.git
   cd devhub
   ```

2. **Install dependencies for both frontend and backend:**
   ```bash
   # In the root directory (or navigate to /server)
   cd server
   npm install

   # In the /client directory
   cd ../client
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the `/server` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/devhub
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Seed the Database (Optional but recommended):**
   ```bash
   cd server
   npm run seed
   ```

5. **Run the Application:**
   Start the backend server (runs on port 5000 by default):
   ```bash
   cd server
   npm run dev
   ```
   
   Start the frontend client (runs on port 5173 by default):
   ```bash
   cd client
   npm run dev
   ```

## 🔒 Security & Roles
The application restricts UI and backend API capabilities based on user roles:
- **Viewer:** Read-only access to projects and tasks.
- **Developer:** Can move tasks on the Kanban board and change assignees.
- **Admin/Owner:** Full control over workspace members, project creation, and settings.

## 📈 Scalability Considerations
- **Optimized Queries:** Dashboard KPIs rely on MongoDB aggregations to compute data on the database level rather than overloading the Node server.
- **Stateless Authentication:** JWT tokens are utilized for efficient scaling.

---
*Built as a Full-Stack Engineering Showcase.*
