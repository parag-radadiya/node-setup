import Redis from 'ioredis';
import config from './config';

const redisConfig = {
  port: config.redis.port, // Redis port
  host: config.redis.host, // Redis host
  // password: config.redis.password, // Redis password if you want Secure
};
const redisClient = new Redis(redisConfig);
module.exports = { redisClient };
