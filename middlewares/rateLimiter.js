import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
// eslint-disable-next-line import/named
import { redisClient } from '../config/redis';

const globalLimiter = rateLimit({
  keyGenerator: (request) => {
    // You can customise the Global Rate Limiter as well
    return `${request.ip}`;
  },
  windowMs: 3600000, // 1 Hour
  max: 3600, // Limit each IP to 3600 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (request, response, next) => {
    next(new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Error Limit is Reached'));
  },
  store: new RedisStore({
    // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
    sendCommand: (...args) => redisClient.call(...args),
  }),
});
module.exports = {
  globalLimiter,
};
