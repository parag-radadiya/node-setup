import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { userService } from 'services';
import ApiError from 'utils/ApiError';
import config from 'config/config';

module.exports = {
  /**
   *  we get the socket and from that we get the Query parameter and that should be the token so that we can verify that user exist and valid
   *  and if it is valid then we are calling the next function and otherwise call the next function with the Error
   * @param socket
   * @param next
   * @returns {*}
   */
  initSubscription(socket, next) {
    const { token } = socket.handshake.query;
    if (!token) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    return jwt.verify(token, config.jwt.secret, {}, (err, decoded) => {
      if (err || !decoded || !decoded.sub) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Bad token', true));
      }
      return userService.getUserById(decoded.sub).then((user) => {
        if (user) {
          // TODO: Add the user Session Init Code he if you have any condition on connection
          // eslint-disable-next-line no-param-reassign
          socket.user = { _id: user._id };
          // eslint-disable-next-line no-param-reassign
          socket.startedAt = new Date();
          socket.join(`user.${decoded.sub}`);
          socket.on('disconnect', function () {
            // TODO: Add the User Disconnect Cleanup Code here
          });
          return next();
        }
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      });
    });
  },
};
