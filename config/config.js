
require ("dotenv").config();

module.exports = {
    development: {
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.HOST_NAME,
    dialect: "postgres"
  },
    production: {
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.HOST_NAME,
    dialect: "postgres"
  }
}