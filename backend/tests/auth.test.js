const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../server')
const User = require('../models/User')

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test')
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!'
      }

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.role).toBe('patient')
    })

    it('should not register user with existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!'
      }

      // Register first user
      await request(app)
        .post('/api/register')
        .send(userData)

      // Try to register with same email
      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(400)

      expect(response.body.error.code).toBe('USER_EXISTS')
    })
  })

  describe('POST /api/login', () => {
    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!'
      }

      await request(app)
        .post('/api/register')
        .send(userData)
    })

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123!'
      }

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(loginData.email)
    })

    it('should not login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(401)

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS')
    })
  })
})
