const config = require('config');

module.exports = function() {
  if (!config.get('jwtPrivateKey')) {
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined');

    //FIXME: instead we throw an exception so the infrastructure we have in place will deal with logging to console and exiting the app.
    // console.error('FATAL ERROR: jwtPrivateKey is not defined');
    // process.exit(1);
  }
};
