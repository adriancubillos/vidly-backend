const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const validate = require('../middleware/validate');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();

router.post('/', validate(validateAuth), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  res.json({
    success : true,
    message : 'Authentication successful!',
    token   : token
  });
});

function validateAuth(req) {
  const schema = {
    email    : Joi.string().min(5).max(255).email({ minDomainAtoms: 2 }).required(),
    password : Joi.string().min(5).max(255).required() // max differs form schema as DB will store hashed value(longer)
  };

  return Joi.validate(req, schema);
}

module.exports = router;
