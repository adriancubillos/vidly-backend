const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function() {
  mongooseObj = mongoose
    .connect('mongodb://localhost:/vidlydb', { useNewUrlParser: true })
    .then(() => winston.info('Connected to MongoDB...'));
};
