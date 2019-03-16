const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User, validateUser } = require('../models/user');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).send(user);
});

router.post('/', [ auth, validate(validateUser) ], async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  // user = new User({
  //   name     : req.body.name,
  //   email    : req.body.email,
  //   password : req.body.password
  // });

  //Using lodash instead useful if the object have lot of properties(20+) and we just need some of them.
  user = new User(_.pick(req.body, [ 'name', 'email', 'password' ]));

  //hashing the password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, [ '_id', 'name', 'email' ]));
});

module.exports = router;
