const winston = require('winston');

module.exports = function(err, req, res, next) {
  winston.info({
    message : err.message,
    meta    : {
      stack : err.stack
    }
  });
  res.status(500).send('Something failed!');
};
