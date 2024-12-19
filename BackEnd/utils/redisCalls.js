const redisClient = require("../config/redisConfig"); // Already initialized Redis client

const redisCacheCall = async (method, key, expiryValue, value) => {
  try {
    if (method === "set") {
      return await setJSON(key, value, expiryValue);
    } else if (method === "get") {
      return await getJSON(key);
    } else if (method === "ttl") {
      return await timeToLive(key);
    } else if (method === "del") {
      return await invalidateCache(key);
    } else {
      throw new Error(`Unsupported Redis method: ${method}`);
    }
  } catch (error) {
    console.error(`Error executing Redis ${method} call:`, error);
    return null; // Return null or a consistent error indicator
  }
};

const setJSON = async (key, value, expiryValue) => {
  try {
    // Store the value as JSON using RedisJSON
    await redisClient.json.set(key, "$", value);

    // Set an expiry if provided
    if (expiryValue) {
      await redisClient.expire(key, expiryValue);
    }

    return true;
  } catch (error) {
    console.error("Error setting JSON in Redis:", error);
    return false;
  }
};

const getJSON = async (key) => {
  try {
    // Check if the key exists
    const exists = await redisClient.exists(key);
    if (!exists) return null;

    // Fetch the JSON value
    const res = await redisClient.json.get(key);
    console.log("redis is working here....", res);
    return res;
  } catch (error) {
    console.error("Error getting JSON from Redis:", error);
    return null;
  }
};

const timeToLive = async (key) => {
  try {
    const ttl = await redisClient.ttl(key);
    return ttl;
  } catch (error) {
    console.error("Error getting TTL from Redis:", error);
    return -1; // Indicate error
  }
};

const invalidateCache = async (key) => {
  try {
    const response = await redisClient.del(key);
    console.log("Cache invalidated for key:", key);
    return response;
  } catch (error) {
    console.error("Error invalidating cache:", error);
    return 0; // Indicate failure
  }
};

module.exports = { redisCacheCall };
