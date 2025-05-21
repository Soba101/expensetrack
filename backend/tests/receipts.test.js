// Tests for receipt routes (upload and list)
// Uses supertest to test the Express app

const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const Receipt = require('../models/Receipt');
require('dotenv').config();

let app;
let token;
let userId;

beforeAll(async () => {
  app = require('express')();
  app.use(require('express').json({ limit: '10mb' }));
  app.use('/api/auth', require('../routes/auth'));
  app.use('/api/receipts', require('../routes/receipts'));
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Register and login a test user
  await User.deleteMany({ username: /testuser/ });
  await request(app).post('/api/auth/register').send({ username: 'testuser2', password: 'testpass123', role: 'user' });
  const res = await request(app).post('/api/auth/login').send({ username: 'testuser2', password: 'testpass123' });
  token = res.body.token;
  userId = (await User.findOne({ username: 'testuser2' }))._id;
});

afterAll(async () => {
  await Receipt.deleteMany({ user: userId });
  await User.deleteMany({ username: /testuser/ });
  await mongoose.connection.close();
});

describe('Receipts API', () => {
  it('should upload a new receipt', async () => {
    const receiptData = {
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      date: new Date().toISOString(),
      amount: 12.34,
      description: 'Test receipt',
    };
    const res = await request(app)
      .post('/api/receipts')
      .set('Authorization', `Bearer ${token}`)
      .send(receiptData);
    expect(res.statusCode).toBe(201);
    expect(res.body.receipt).toBeDefined();
    expect(res.body.receipt.amount).toBe(12.34);
  });

  it('should list receipts for the user', async () => {
    const res = await request(app)
      .get('/api/receipts')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should not allow access without a token', async () => {
    const res = await request(app)
      .get('/api/receipts');
    expect(res.statusCode).toBe(401);
  });
}); 