# Real-Time Chat Backend

A real-time chat backend built with Node.js, Express.js, and Socket.IO.

## Features

- Real-time messaging with Socket.IO
- Multiple chat rooms
- User authentication via JWT
- Typing indicators
- Online users list
- Private messaging
- Rate limiting for messages
- Clean architecture with modular structure

## Project Structure

```
src/
├── config/          # Configuration files
├── sockets/         # Socket.IO event handlers
├── controllers/     # Business logic (optional)
├── routes/          # API routes
├── middleware/      # Authentication and other middleware
├── models/          # Database models (optional)
├── utils/           # Helper functions
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   ```

## Running the Server

For development:
```
npm run dev
```

For production:
```
npm start
```

The server will start on port 3000 (or the port specified in .env).

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/rooms` - List available rooms
- `POST /api/auth/register` - Register with `{ username, password }` and receive JWT.
- `POST /api/auth/login` - Login with `{ username, password }` and receive JWT.

## Auth flow

1. Client registers or logs in with `/api/auth/login`.
2. Use returned JWT in Socket.IO handshake:
```js
const socket = io('http://localhost:3000', {
  auth: {
    token: '<JWT_TOKEN>'
  }
});
```

## Socket Events

### Client to Server

- `join_room` - Join a chat room
  ```json
  { "room": "general" }
  ```
- `leave_room` - Leave a chat room
  ```json
  { "room": "general" }
  ```
- `send_message` - Send a message to a room
  ```json
  { "room": "general", "message": "Hello world!" }
  ```
- `typing` - Indicate typing status
  ```json
  { "room": "general", "isTyping": true }
  ```
- `private_message` - Send private message
  ```json
  { "toUsername": "user2", "message": "Private hello" }
  ```

### Server to Client

- `receive_message` - Receive a message
  ```json
  {
    "username": "user1",
    "room": "general",
    "message": "Hello world!",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
  ```
- `user_joined` - User joined the room
- `user_left` - User left the room
- `online_users` - List of online users in room
- `user_typing` - User typing status
- `private_message` - Receive private message
- `rate_limit_exceeded` - Rate limit exceeded

## Authentication

Sockets require JWT authentication. Include the token in the handshake:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

## Notes

- This implementation uses in-memory storage. For production, consider using a database like MongoDB or Redis for persistence.
- CORS is configured to allow all origins. Update for production security.