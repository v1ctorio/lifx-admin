import { createClient } from "redis";

async function loadDB() {
const redisClient = createClient();
redisClient.on("error", (err) => {
  console.error(err);
});
await redisClient.connect();
return redisClient;
}
export default loadDB;