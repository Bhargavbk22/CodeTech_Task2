// Message model (in-memory demo). For production, replace with database-backed model.
class Message {
  constructor({ username, room, message, timestamp }) {
    this.username = username;
    this.room = room;
    this.message = message;
    this.timestamp = timestamp;
  }
}

module.exports = Message;
