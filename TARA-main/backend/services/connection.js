const snowflake = require("snowflake-sdk");

const AWS = require("aws-sdk");
require("dotenv").config();

// Snowflake connection
const account = process.env.SNOWFLAKE_ACCOUNT;

const user = process.env.SNOWFLAKE_USERNAME;
const password = process.env.SNOWFLAKE_PASSWORD;

const database = process.env.SNOWFLAKE_DATABASE;

const connection = snowflake.createConnection({
  account: account,

  username: user,
  password: password,
  database: database,
  clientSessionKeepAlive: true, // default = false
  clientSessionKeepAliveHeartbeatFrequency: 30,
});

module.exports = connection;
