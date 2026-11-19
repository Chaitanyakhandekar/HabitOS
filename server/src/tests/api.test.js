import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('HabitOS Public API Endpoints', () => {
  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('HabitOS API');
  });

  it('Protected endpoints reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/habits');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('POST /api/auth/register fails validation when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'MismatchPassword',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Passwords do not match');
  });

  it('Returns 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/nonexistent-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
