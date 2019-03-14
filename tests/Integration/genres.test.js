const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/genres', () => {
  beforeEach(() => {
    server = require('../../index');
  });
  afterEach(async () => {
    server.close();
    await Genre.remove({});
  });

  describe('GET /', () => {
    beforeEach(() => {
      server = require('../../index');
    });
    afterEach(async () => {
      server.close();
      await Genre.remove({});
    });

    it('should return all genres', async () => {
      await Genre.collection.insertMany([ { genre: 'genre1' }, { genre: 'genre2' } ]);
      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.genre === 'genre1')).toBeTruthy();
      expect(res.body.some((g) => g.genre === 'genre2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    beforeEach(() => {
      server = require('../../index');
    });
    afterEach(async () => {
      server.close();
      await Genre.remove({});
    });
    it('should return a genre if a valid id is passed', async () => {
      const genre = new Genre({ genre: 'genre1' });
      await genre.save();

      const res = await request(server).get('/api/genres/' + genre._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('genre', genre.genre);
    });
    it('should return 404 if an invalid id is passed', async () => {
      try {
        await request(server).get('/api/genres/1');
      } catch (ex) {
        // console.log('ex', ex);
        expect(ex.status).toBe(404);
      }
    });
    it('should return 404 if no genre with the given id exists', async () => {
      try {
        const id = mongoose.Types.ObjectId();
        await request(server).get('/api/genres/' + id);
      } catch (ex) {
        // console.log('ex', ex);
        expect(ex.status).toBe(404);
      }
    });
  });

  describe('POST /', () => {
    // Define the happy path, and then in each test we change
    // one parameter that clearly aligns with the name of the
    // test

    let token;
    let genre;

    const exec = async () => {
      //prettier-ignore
      return await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ genre }); //in ES6 if key and value are the same we can just send the key
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      genre = 'genre1';
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      try {
        await exec();
      } catch (ex) {
        expect(ex.status).toBe(401);
      }
    });

    it('should return 400 if genre is less than 5 characters', async () => {
      try {
        genre = '1234';
        await exec();
      } catch (ex) {
        expect(ex.status).toBe(400);
      }
    });
    it('should return 400 if genre is more than 50 characters', async () => {
      try {
        genre = new Array(52).join('a');
        await exec();
      } catch (ex) {
        expect(ex.status).toBe(400);
      }
    });

    it('should save the genre if it is valid', async () => {
      await exec();
      const genre = await Genre.find({ genre: 'genre1' });
      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('genre', 'genre1');
    });
  });
});
