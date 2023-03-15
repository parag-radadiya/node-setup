import path from 'path';
import httpStatus from 'http-status';
import mongoosePaginate from 'mongoose-paginate-v2';
import cors from 'cors';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import helmet from 'helmet';
import express from 'express';
import fileUpload from 'express-fileupload';
import expressWinston from 'express-winston';
import winstonInstance from 'config/winston';
import passport from 'passport';
import jwtStrategy from 'config/passport';
// eslint-disable-next-line import/named
import { globalLimiter } from 'middlewares/rateLimiter';
import routes from 'routes';
import ApiError from 'utils/ApiError';
import { errorConverter, errorHandler } from 'middlewares/error';
import sendResponse from 'middlewares/sendResponse';
import config from 'config/config';
import { successHandler, errorHandler as morganErrorHandler } from 'config/morgan';

const actuator = require('express-actuator');

mongoosePaginate.paginate.options = {
  customLabels: { docs: 'results', totalDocs: 'totalResults' },
};
const app = express();
app.use(actuator());
if (config.env !== 'test') {
  app.use(successHandler);
  app.use(morganErrorHandler);
}
// set security HTTP headers
app.use(helmet());
// parse json request body
app.use(express.json());
app.use(fileUpload());
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
// sanitize request data
app.use(xss());
app.use(mongoSanitize());
// gzip compression
app.use(compression());
// set api response
app.use(sendResponse);
// enable cors
app.use(cors());
app.options('*', cors());
app.use(express.static(path.join(__dirname, '../public')));
// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
// limit repeated failed requests to auth endpoints
if (config.env !== 'development') {
  app.use('/v1', globalLimiter);
}
// v1 api routes
app.use('/v1', routes);
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});
// convert error to ApiError, if needed
app.use(errorConverter);
// handle error
app.use(errorHandler);
if (config.env === 'development') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(
    expressWinston.logger({
      winstonInstance,
      meta: true, // optional: log meta data about request (defaults to true)
      msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
      colorStatus: true, // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    })
  );
}
export default app;
