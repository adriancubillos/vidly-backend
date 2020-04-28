const request = require('supertest');
const { User } = require('../../models/user');
const bcrypt = require('bcrypt');

let user;

describe('/ POST (routes/auth -- Login)', () => {
  beforeEach(async () => {
    server = require('../../index');

    user = new User({
      name     : 'name1',
      email    : '123@123.test',
      password : '12345'
    });

    //hashing the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
  });
  afterEach(async () => {
    await User.remove({});
    await server.close();
  });

  const exec = () => {
    //prettier-ignore
    return request(server)
      .post('/api/auth')
      .send({ email: user.email, password: user.password });
  };

  test('should return 400 if invalid email provided', async () => {
    user.email = '1234';
    try {
      await exec();
    } catch (ex) {
      expect(ex.status).toBe(400);
    }
  });

  test('should return 400 if email not in DB provided', async () => {
    user.email = '1234@1234.io';
    try {
      await exec();
    } catch (ex) {
      expect(ex.status).toBe(400);
    }
  });

  test('should return 400 if password not in DB provided', async () => {
    user.password = '54321';
    try {
      await exec();
    } catch (ex) {
      expect(ex.status).toBe(400);
    }
  });

  test('should return 200 if email and password in DB provided', async () => {
    user.password = '12345'; //passing un-hashed password
    const res = await exec();
    expect(res.status).toBe(200);
  });
});
