const auth = require('../middleware/auth');

const validate = require('../middleware/validate');
const { Movie, validateMovie, validateUpdate } = require('../models/movie');
const { Genre } = require('../models/genre');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const movies = await Movie.find().sort({ title: 1 });
  res.status(200).send(movies);
});

router.post('/', [ auth, validate(validateMovie) ], async (req, res) => {
  const genreObj = await Genre.findById(req.body.genreId);
  if (!genreObj) return res.status(400).send(`The genre ID: ${req.params.genreId} is not valid!`);

  const movie = new Movie({
    title           : req.body.title,
    genre           : {
      _id   : genreObj._id,
      genre : genreObj.genre
    },
    numberInStock   : req.body.numberInStock,
    dailyRentalRate : req.body.dailyRentalRate
  });

  await movie.save();
  res.send(movie);
});

router.put('/:id', [ auth, validate(validateUpdate) ], async (req, res) => {
  let updateFields = {};
  if (req.body.title) updateFields.title = req.body.title;
  if (req.body.numberInStock) updateFields.numberInStock = req.body.numberInStock;
  if (req.body.dailyRentalRate) updateFields.dailyRentalRate = req.body.dailyRentalRate;

  if (req.body.genreId) {
    const genreObj = await Genre.findById(req.body.genreId);
    if (!genreObj) return res.status(400).send(`The genre ID: ${req.params.genreId} is not valid!`);
    updateFields.genre = {
      _id   : genreObj._id,
      genre : genreObj.genre
    };
  }

  const movie = await Movie.findByIdAndUpdate(req.params.id, updateFields, { new: true });
  if (!movie)
    return res.status(400).send(`The movie with the given ID: ${req.params.id} was not found!`);
  res.send(movie);
});

router.delete('/:id', auth, async (req, res) => {
  let movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie)
    return res.status(404).send(`The movie with the given ID: ${req.params.id} was not found!`);
  res.send(movie);
});

router.get('/:id', async (req, res) => {
  let movie = await Movie.findById(req.params.id);
  if (!movie)
    return res.status(404).send(`The movie with the given ID: ${req.params.id} was not found!`);
  res.send(movie);
});

module.exports = router;
