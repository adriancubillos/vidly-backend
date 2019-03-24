const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  name     : {
    type      : String,
    required  : true,
    minlength : 2,
    maxlength : 50
  },
  email    : {
    type      : String,
    required  : true,
    unique    : true,
    minlength : 5,
    maxlength : 255
  },
  password : {
    type      : String,
    required  : true,
    minlength : 5,
    maxlength : 1024
  },
  isAdmin  : Boolean
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
  return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    name     : Joi.string().min(2).max(50).required(),
    email    : Joi.string().min(5).max(255).email({ minDomainAtoms: 2 }).required(),
    password : Joi.string().min(5).max(255).regex(/^[a-zA-Z0-9]{3,30}$/).required(), // max differs form schema as DB will store hashed value(longer)
    isAdmin  : Joi.boolean().required()
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.userSchema = userSchema;
exports.validateUser = validateUser;
