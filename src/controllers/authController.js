const jwt = require('jsonwebtoken');

// Very simple in-memory store for demo purposes
const usersDb = []; // { username, password }

const generateToken = (user) => {
  const payload = {
    username: user.username,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const register = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const existingUser = usersDb.find((u) => u.username === username);
  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  usersDb.push({ username, password });
  const token = generateToken({ username });

  return res.status(201).json({ message: 'User registered', token });
};

const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = usersDb.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken({ username });
  return res.status(200).json({ message: 'Logged in', token });
};

module.exports = { register, login };