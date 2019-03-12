const auth = require('../middleware/auth');
const { Rental, validate } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort({ dayOut: -1 });
  res.status(200).send(rentals);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send(`The customer ID: ${req.body.customerId} is not valid!`);

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send(`The movie ID: ${req.body.movieId} is not valid!`);

  //Business Logic
  if (movie.numberInStock < 1) return res.status(400).send(`The movie : ${movie.title} is not in stock!`);

  let rental = new Rental({
    customer : {
      _id   : customer._id,
      name  : customer.name,
      phone : customer.phone
    },
    movie    : {
      _id             : movie._id,
      title           : movie.title,
      dailyRentalRate : movie.dailyRentalRate
    }
  });

  // try {
  //   await rental.save();
  //   movie.numberInStock--;
  //   await movie.save();
  //   res.status(200).send({ rentalRes: rental, movieRes: movie });
  // } catch (error) {
  //   res.status(500).send('Transaction Failed');
  // }

  try {
    await new Fawn.Task()
      .save('rentals', rental)
      .update('movies', { _id: movie._id }, { $inc: { numberInStock: -1 } })
      .run();
    res.status(200).send({ rentalRes: rental, movieRes: movie });
  } catch (ex) {
    // At this point, all operations are automatically rolled back
    res.status(500).send('Transaction Failed' + ex);
  }
});

module.exports = router;
