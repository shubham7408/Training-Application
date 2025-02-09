const redis = require("redis");
// require('dotenv').config();

const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 10000, // 10 seconds
    keepAlive: 5000, // 5 seconds
  },
  retry_strategy: (options) => {
    if (options.error && options.error.code === "ECONNREFUSED") {
      return new Error("The Redis server refused the connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

client.on("error", (err) => console.log(`Redis Client Error: ${err}`));

client
  .connect()
  .then(() => {
    console.log("Connected to Redis server");
  })
  .catch((error) => {
    console.error("Error connecting to Redis:", error);
  });

client.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

client.on("end", () => {
  console.log("Redis connection closed");
});

module.exports = client;
