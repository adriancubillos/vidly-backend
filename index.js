const winston = require('winston');
const express = require('express');
const app = express();

require('./startup/logging')();
require('./startup/prod')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')(); //TODO: Why did we do this...?

/** 
 * Open connection and port Config.
 */
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  winston.info(`Express listening on port ${port}`);
});

module.exports = server;
