const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use JavaScript promises
const { Mongo } = require('../environment');

const uri = `mongodb://${Mongo.HOST}:${Mongo.PORT}/${Mongo.NAME}`;

/**
 , {
  auth: { authSource: Mongo.AUTH },
  user: Mongo.USER,
  pass: Mongo.PASS
}
 */
const db = mongoose.createConnection(uri);
db.on('error', console.error.bind(console, 'Database connection error:'));

module.exports = db;
