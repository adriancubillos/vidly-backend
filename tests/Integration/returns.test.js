const moment = require('moment');
const request = require('supertest');
const { Rental } = require('../../models/rental');
const { Movie } = require('../../models/movie');
const mongoose = require('mongoose');
const { User } = require('../../models/user');

let customerId;
let movie;
let movieId;
let rental;
let server;
let token;

describe('/api/returns', () => {
  beforeEach(async () => {
    server = require('../../index');
    token = new User().generateAuthToken();

    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();

    movie = new Movie({
      _id             : movieId,
      dailyRentalRate : 2,
      genre           : { genre: '12345' },
      numberInStock   : 10,
      title           : '12345'
    });

    await movie.save();

    rental = new Rental({
      customer : {
        _id   : customerId,
        name  : '12345',
        phone : '12345'
      },
      movie    : {
        _id             : movieId,
        title           : '123',
        dailyRentalRate : 2
      }
    });
    await rental.save();
  });
  afterEach(async () => {
    await server.close();
    await Rental.remove({});
    await Movie.remove({});
  });
  const exec = () => {
    //prettier-ignore
    return request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId }); //in ES6 if key and value are the same we can just send the key
  };

  // test('should work!', async () => {
  //   const result = await Rental.findById(rental._id);
  //   expect(result).not.toBeNull();
  // });

  test('should return 401 if client is not logged in', async () => {
    try {
      await exec();
    } catch (ex) {
      expect(ex.status).toBe(401);
    }
  });

  test('should return 400 if customerId is not provided', async () => {
    try {
      customerId = '';
      await exec();
    } catch (ex) {
      expect(ex.status).toBe(400);
    }
  });

  test('should return 400 if movieId is not provided', async () => {
    try {
      movieId = '';
      await exec();
    } catch (ex) {
      expect(ex.status).toBe(400);
    }
  });

  test('should return 404 if no rental found for this customer/movie', async () => {
    try {
      await Rental.remove({});
      await exec();
    } catch (ex) {
      expect(ex.status).toBe(404);
    }
  });

  test('should return 400 if return is already processed', async () => {
    try {
      rental.dateReturned = new Date();
      await rental.save();
      await exec();
    } catch (ex) {
      expect(ex.status).toBe(400);
    }
  });

  test('should return 200 if valid request', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  test('should set the returnDate if input is valid', async () => {
    await exec();
    const updatedRental = await Rental.findById(rental._id);
    // expect(updatedRental).toHaveProperty('dateReturned');
    const diff = new Date() - updatedRental.dateReturned;
    expect(diff).toBeLessThan(100); //can be useful to test performance.
  });

  test('should set the rentalFee if input is valid', async () => {
    rental.dateOut = moment().add(-7, 'days').toDate();
    await rental.save();
    await exec();

    const updatedRental = await Rental.findById(rental._id);

    expect(updatedRental.rentalFee).toBe(14);
  });

  test('should increase the movie stock if input is valid', async () => {
    await exec();

    const updatedMovie = await Movie.findById(movie._id);

    expect(updatedMovie.numberInStock).toBe(movie.numberInStock + 1);
  });
  test('should return the rental if input is valid', async () => {
    const res = await exec();

    const updatedRental = await Rental.findById(rental._id);

    // expect(res.body).toMatchObject(updatedRental); //FIXME: To specific
    //FIXME: To long
    // expect(res.body).toHaveProperty('dateOut');
    // expect(res.body).toHaveProperty('dateReturned');
    // expect(res.body).toHaveProperty('rentalFee');
    // expect(res.body).toHaveProperty('customer');
    // expect(res.body).toHaveProperty('movie');

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([ 'dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie' ])
    );
  });
});
