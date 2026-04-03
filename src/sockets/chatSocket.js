const { authenticateSocket } = require('../middleware/auth');
const { RateLimiter } = require('../utils/helpers');

// In-memory storage for users in rooms
const usersInRooms = {}; // { room: [socketId1, socketId2, ...] }
const userInfo = {}; // { socketId: { username, room } }

// Rate limiter for messages (10 messages per minute per user)
const messageRateLimiter = new RateLimiter(60000, 10);

module.exports = (io) => {
  // Use authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.id})`);

    // Join room event
    socket.on('join_room', (data) => {
      const { room } = data;
      socket.join(room);

      // Add user to room tracking
      if (!usersInRooms[room]) {
        usersInRooms[room] = [];
      }
      usersInRooms[room].push(socket.id);
      userInfo[socket.id] = { username: socket.username, room };

      // Notify others in the room
      socket.to(room).emit('user_joined', {
        username: socket.username,
        message: `${socket.username} joined the room`,
        timestamp: new Date().toISOString()
      });

      // Send online users in room
      const onlineUsers = usersInRooms[room].map(id => userInfo[id].username);
      io.to(room).emit('online_users', { room, users: onlineUsers });
    });

    // Leave room event
    socket.on('leave_room', (data) => {
      const { room } = data;
      socket.leave(room);

      // Remove user from room tracking
      if (usersInRooms[room]) {
        usersInRooms[room] = usersInRooms[room].filter(id => id !== socket.id);
      }
      delete userInfo[socket.id];

      // Notify others
      socket.to(room).emit('user_left', {
        username: socket.username,
        message: `${socket.username} left the room`,
        timestamp: new Date().toISOString()
      });

      // Update online users
      const onlineUsers = usersInRooms[room] ? usersInRooms[room].map(id => userInfo[id].username) : [];
      io.to(room).emit('online_users', { room, users: onlineUsers });
    });

    // Send message event
    socket.on('send_message', (data) => {
      const { room, message } = data;

      // Rate limiting
      if (!messageRateLimiter.isAllowed(socket.username)) {
        socket.emit('rate_limit_exceeded', { message: 'Too many messages. Please wait.' });
        return;
      }

      const messageData = {
        username: socket.username,
        room,
        message,
        timestamp: new Date().toISOString()
      };

      // Broadcast to room
      io.to(room).emit('receive_message', messageData);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { room, isTyping } = data;
      socket.to(room).emit('user_typing', {
        username: socket.username,
        isTyping
      });
    });

    // Private message
    socket.on('private_message', (data) => {
      const { toUsername, message } = data;
      // Find socket id of recipient
      const recipientSocketId = Object.keys(userInfo).find(id => userInfo[id].username === toUsername);
      if (recipientSocketId) {
        const messageData = {
          from: socket.username,
          to: toUsername,
          message,
          timestamp: new Date().toISOString()
        };
        io.to(recipientSocketId).emit('private_message', messageData);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username} (${socket.id})`);

      // Remove from all rooms
      const userData = userInfo[socket.id];
      if (userData) {
        const { room } = userData;
        if (usersInRooms[room]) {
          usersInRooms[room] = usersInRooms[room].filter(id => id !== socket.id);
          socket.to(room).emit('user_left', {
            username: socket.username,
            message: `${socket.username} left the room`,
            timestamp: new Date().toISOString()
          });
          const onlineUsers = usersInRooms[room].map(id => userInfo[id].username);
          io.to(room).emit('online_users', { room, users: onlineUsers });
        }
        delete userInfo[socket.id];
      }
    });
  });
};