// User model (in-memory demo). For production, replace with database-backed model.
class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
}

module.exports = User;
