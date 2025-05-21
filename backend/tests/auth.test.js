// Tests for authentication routes (register and login)
// Uses supertest to test the Express app

const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

let app;

beforeAll(async () => {
  // Import the app after setting env vars
  app = require('express')();
  app.use(require('express').json({ limit: '10mb' }));
  app.use('/api/auth', require('../routes/auth'));
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await User.deleteMany({ username: /testuser/ }); // Clean up test users
  await mongoose.connection.close();
});

describe('Auth API', () => {
  const testUser = {
    username: 'testuser1',
    password: 'testpass123',
    role: 'user',
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should not register the same user twice', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Username already exists');
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: testUser.username, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe(testUser.username);
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: testUser.username, password: 'wrongpass' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });
}); 