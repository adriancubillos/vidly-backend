const mongoose = require('mongoose');
const Joi = require('joi');

const rentalSchema = new mongoose.Schema({
  customer    : {
    type     : new mongoose.Schema({
      name   : {
        type      : String,
        required  : true,
        minlength : 2,
        maxlength : 50
      },
      isGold : { type: Boolean, default: false },
      phone  : {
        type      : String,
        required  : true,
        minlength : 2,
        maxlength : 50
      }
    }),
    required : true
  },
  movie       : {
    type     : new mongoose.Schema({
      title           : {
        type      : String,
        required  : true,
        trim      : true,
        minlength : 3,
        maxlength : 255
      },
      dailyRentalRate : {
        type     : Number,
        required : true,
        min      : 0,
        max      : 255
      }
    }),
    required : true
  },
  dayOut      : {
    type     : Date,
    required : true,
    default  : Date.now
  },
  dayReturned : {
    type : Date
  },
  rentalFee   : {
    type : Number,
    min  : 0
  }
});

const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(movie) {
  const schema = {
    customerId : Joi.objectId().required(),
    movieId    : Joi.objectId().required()
  };

  return Joi.validate(movie, schema);
}

exports.Rental = Rental;
exports.validate = validateRental;
