import { createClient } from "redis";

async function loadDB() {
const redisClient = createClient({
  database: process.env.LIFXA_REDIS_DB ? parseInt(process.env.LIFXA_REDIS_DB) : 0,
  url: `redis://localhost:${process.env.REDIS_PORT}`,
});
redisClient.on("error", (err) => {
  console.error(err);
});
await redisClient.connect();
return redisClient;
}
export default loadDB;