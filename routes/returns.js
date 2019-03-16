const Joi = require('joi');

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const express = require('express');
const router = express.Router();

router.post('/', [ auth, validate(validateReturn) ], async (req, res) => {
  //Cleaning up code using static method as lookup does not depends on each instance of rental.
  // It is General
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send('No rental found for this customer/movie');

  if (rental.dateReturned) return res.status(400).send('Return already processed');

  // FIXME: By Information Expert Principle
  // Rental is better suited to handle this code in a method like:
  // rental.return(); this will be an instance method as it depends on each rental object.
  // const rentalDays = moment().diff(rental.dateOut, 'days');
  // rental.dateReturned = new Date();
  // rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;
  rental.return();
  await rental.save();

  await Movie.update(
    { _id: rental.movie._id },
    {
      $inc : { numberInStock: 1 }
    }
  );

  return res.send(rental);
});

function validateReturn(request) {
  const schema = {
    customerId : Joi.objectId().required(),
    movieId    : Joi.objectId().required()
  };

  return Joi.validate(request, schema);
}

module.exports = router;
