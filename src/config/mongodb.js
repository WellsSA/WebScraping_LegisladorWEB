require('dotenv').config();
const mongoose = require('mongoose');

const host = process.env.MONGODB_HOST;
const user = process.env.MONGODB_USER;
const pass = process.env.MONGODB_PASS;

const database = mongoose
  .connect(
    `mongodb+srv://${user}:${pass}@${host}/db_the_big_bang_theory`,
    { useNewUrlParser: true },
  )
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.error('Falha ao conectar', err));

module.exports = database;
