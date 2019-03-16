const mongoose = require('mongoose');
const Joi = require('joi');
const { genreSchema } = require('./genre');

const movieSchema = new mongoose.Schema({
  title           : {
    type      : String,
    required  : true,
    trim      : true,
    minlength : 3,
    maxlength : 255
  },
  genre           : {
    type     : genreSchema,
    required : true
  },
  numberInStock   : {
    type     : Number,
    required : true,
    min      : 0,
    max      : 255
  },
  dailyRentalRate : {
    type     : Number,
    required : true,
    min      : 0,
    max      : 255
  }
});

const Movie = mongoose.model('Movie', movieSchema);

function validateMovie(movie) {
  const schema = {
    title           : Joi.string().min(3).max(255).required(),
    genreId         : Joi.string().required(),
    numberInStock   : Joi.number().min(0).max(255).required(),
    dailyRentalRate : Joi.number().min(0).max(255).required()
  };

  return Joi.validate(movie, schema);
}

function validateUpdateMovie(movie) {
  const schema = {
    title           : Joi.string().min(3).max(255),
    genreId         : Joi.objectId().require(),
    numberInStock   : Joi.number().min(0).max(255),
    dailyRentalRate : Joi.number().min(0).max(255)
  };

  return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.movieSchema = movieSchema;
exports.validateMovie = validateMovie;
exports.validateUpdate = validateUpdateMovie;
