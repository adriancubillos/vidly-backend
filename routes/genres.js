const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Genre, validate } = require('../models/genre');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  // throw new Error('could not get the genres');
  const genres = await Genre.find().sort({ genre: 1 });
  res.status(200).send(genres);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({ genre: req.body.genre });
  await genre.save();

  res.send(genre);
});

router.put('/:id', [ validateObjectId, auth ], async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let genre = await Genre.findByIdAndUpdate(
    req.params.id,
    {
      $set : {
        genre : req.body.genre
      }
    },
    { new: true } // with this returns the updated doc, without it returns the original doc before update operation
  );

  if (!genre) return res.status(404).send(`The genre with the given ID: ${req.params.id} was not found!`);

  res.send(genre);
});

router.delete('/:id', [ validateObjectId, auth, admin ], async (req, res) => {
  let genre = await Genre.findByIdAndDelete(req.params.id);

  if (!genre) return res.status(404).send(`The genre with the given ID: ${req.params.id} was not found!`);

  res.send(genre);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id).sort({ genre: 1 });

  if (!genre) return res.status(404).send(`The genre with the given ID: ${req.params.id} was not found!`);

  res.send(genre);
});

module.exports = router;
