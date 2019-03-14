const request = require('supertest');
const { User } = require('../../models/user');
const { Genre } = require('../../models/genre');

let server;

describe('auth middleware', () => {
  let token;

  beforeEach(() => {
    server = require('../../index');
  });
  afterEach(async () => {
    await Genre.remove({});
  });

  const exec = () => {
    return request(server).post('/api/genres').set('x-auth-token', token).send({ genre: 'genre1' });
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  afterEach(() => {
    server.close();
  });

  test('should return 401 if no token is provided', async () => {
    token = '';
    try {
      await exec();
    } catch (ex) {
      expect(ex.status).toBe(401);
    }
  });

  test('should return 400 if token is invalid', async () => {
    token = null;
    try {
      await exec();
    } catch (ex) {
      expect(ex.status).toBe(400);
    }
  });
  test('should return 200 if token is valid', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
});
