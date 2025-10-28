import app from '#src/app.js';
import request from 'supertest';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('GET /api', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/api');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Acquisitions API is running!');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 Not Found', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });
})