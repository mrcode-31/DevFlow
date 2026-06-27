require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const socketService = require('./socketService');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize Socket.io
    const io = socketService.init(server);
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
      
      socket.on('join_project', (projectId) => {
        socket.join(projectId);
        console.log(`Socket ${socket.id} joined project ${projectId}`);
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
