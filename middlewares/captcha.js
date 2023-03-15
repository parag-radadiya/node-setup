import httpStatus from 'http-status';
import _ from 'lodash';
import ApiError from 'utils/ApiError';
import validateCaptcha from '../config/captcha';
/**
 *
 * @param key will be which contain in the body quey or params and we will get those key value and validate the captcha
 * if it verify successfully then we will call the next function otherwise throw the Error
 * @returns {(function(*, *, *): (*))|*}
 */
const verifyCaptcha = (key) => (req, res, next) => {
  const validKey = ['params', 'query', 'body'].map((item) => `${item}.${key}`);
  // here we get validKey in object like { params: {}, query: {}, body: {} }
  const captchaObject = _.pick(req, validKey);
  //  here we get validKey in array of string like ['params', 'query', 'body']
  // we use this because we get values like {body: { captcha: '' }}
  const captchaObjectKey = Object.keys(captchaObject);
  // for now, we get values only in body so that here we used object[objectKey] it returns captcha in array.
  const captchaKeys = Object.values(captchaObject[captchaObjectKey]).filter((item) => item);
  if (captchaKeys.length > 1) {
    return next(new ApiError('Multiple key Detected', httpStatus.BAD_REQUEST));
  }
  return validateCaptcha(captchaKeys[0])
    .then((captchaVerified) => {
      // if captcha verification is failed from user side or if we provide wrong secreteKey then it throws an error.
      if (!captchaVerified) {
        return next(new ApiError('Invalid captcha', httpStatus.BAD_REQUEST));
      }
      return next();
    })
    .catch((error) => {
      return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
    });
};
module.exports = verifyCaptcha;
