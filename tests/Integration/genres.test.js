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

  describe('PUT /', () => {
    let token;
    let newGenre;
    let genre;
    let id;

    const exec = async () => {
      //prettier-ignore
      return await request(server)
        .put('/api/genres/' + id)
        .set('x-auth-token', token)
        .send({ genre: newGenre });
    };

    beforeEach(async () => {
      // Before each test we need to create a genre and
      // put it in the database.
      genre = new Genre({ genre: 'genre1' });
      await genre.save();

      token = new User().generateAuthToken();
      id = genre._id;
      newGenre = 'updatedGenre';
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
      newGenre = '1234';
      try {
        const res = await exec();
      } catch (ex) {
        expect(ex.status).toBe(400);
      }
    });

    it('should return 400 if genre is more than 50 characters', async () => {
      newGenre = new Array(52).join('a');
      try {
        await exec();
      } catch (ex) {
        expect(ex.status).toBe(400);
      }
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;
      try {
        await exec();
      } catch (ex) {
        expect(ex.status).toBe(404);
      }
    });

    it('should return 404 if genre with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();
      try {
        await exec();
      } catch (ex) {
        expect(ex.status).toBe(404);
      }
    });

    it('should update the genre if input is valid', async () => {
      await exec();

      const updatedGenre = await Genre.findById(genre._id);

      expect(updatedGenre.genre).toBe(newGenre);
    });

    it('should return the updated genre if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('genre', newGenre);
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let genre;
    let id;

    const exec = async () => {
      return await request(server).delete('/api/genres/' + id).set('x-auth-token', token).send();
    };

    beforeEach(async () => {
      // Before each test we need to create a genre and
      // put it in the database.
      genre = new Genre({ genre: 'genre1' });
      await genre.save();

      id = genre._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      try {
        await exec();
      } catch (ex) {
        expect(ex.status).toBe(401);
      }
    });

    it('should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken();
      try {
        await exec();
      } catch (ex) {
        expect(ex.status).toBe(403);
      }
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;
      try {
        await exec();
      } catch (ex) {
        expect(ex.status).toBe(404);
      }
    });

    it('should return 404 if no genre with the given id was found', async () => {
      id = mongoose.Types.ObjectId();
      try {
        await exec();
      } catch (ex) {
        expect(ex.status).toBe(404);
      }
    });

    it('should delete the genre if input is valid', async () => {
      await exec();

      const genreInDb = await Genre.findById(id);

      expect(genreInDb).toBeNull();
    });

    it('should return the removed genre', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', genre._id.toHexString());
      expect(res.body).toHaveProperty('genre', genre.genre);
    });
  });
});
