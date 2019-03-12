require('express-async-errors');
const winston = require('winston');
require('winston-mongodb');

module.exports = function() {
  winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: 'uncaughtExceptions.log' })
  );
  // process.on('uncaughtException', (ex) => {
  //   // console.log('WE GOT AN UNCAUGHT EXCEPTION');
  //   winston.error({
  //     message : ex.message,
  //     meta    : {
  //       stack : ex.stack
  //     }
  //   });
  //   process.exit(1);
  // });

  process.on('unhandledRejection', (ex) => {
    // console.log('WE GOT AN UNHANDLED REJECTION');
    // winston.error({
    //   message : ex.message,
    //   meta    : {
    //     stack : ex.stack
    //   }
    // });
    // process.exit(1);
    throw ex;
  });

  winston.add(new winston.transports.File({ filename: 'log_vidly.log' }));
  // winston.add(new winston.transports.Console());
  winston.add(
    new winston.transports.MongoDB({
      db      : 'mongodb://localhost:/vidlydb',
      level   : 'error',
      options : { useNewUrlParser: true }
    })
  );

  //FIXME: to test unhandled exceptions and rejections
  // throw new Error('something failed during startup!!!!');
  // const p = Promise.reject(new Error('something failed miserably'));
  // p.then(() => console.log('done'));
};
