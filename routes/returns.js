const Joi = require('joi');
const moment = require('moment');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const express = require('express');
const router = express.Router();

router.post('/', [ auth, validate(validateReturn) ], async (req, res) => {
  const { error } = validateReturn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const rental = await Rental.findOne({
    'customer._id' : req.body.customerId,
    'movie._id'    : req.body.movieId
  });

  if (!rental) return res.status(404).send('No rental found for this customer/movie');

  if (rental.dateReturned) return res.status(400).send('Return already processed');

  const rentalDays = moment().diff(rental.dateOut, 'days');
  rental.dateReturned = new Date();
  rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;
  rental.save();

  await Movie.update(
    { _id: rental.movie._id },
    {
      $inc : { numberInStock: 1 }
    }
  );

  return res.status(200).send(rental);
});

function validateReturn(request) {
  const schema = {
    customerId : Joi.objectId().required(),
    movieId    : Joi.objectId().required()
  };

  return Joi.validate(request, schema);
}

module.exports = router;
