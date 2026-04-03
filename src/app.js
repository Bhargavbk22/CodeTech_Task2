const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Assuming we add cors for frontend

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const healthRoutes = require('./routes/health');
const roomRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');

app.use('/api', healthRoutes);
app.use('/api', roomRoutes);
app.use('/api', authRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*", // In production, specify your frontend URL
    methods: ["GET", "POST"]
  }
});

// Socket handlers
require('./sockets/chatSocket')(io);

module.exports = { app, server, io };