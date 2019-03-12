const winston = require('winston');
const express = require('express');
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
/** 
 * Open connection and port Config.
 */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  winston.info(`Express listening on port ${port}`);
});
