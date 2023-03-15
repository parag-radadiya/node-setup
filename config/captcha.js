import { stringify } from 'querystring';
import fetch from 'node-fetch';
import config from './config';
// this function return that captcha is verified or not.
// first it's take captcha from body(which come from front-end part).
// then verify with the siteverify url.
const validateCaptcha = async (captcha) => {
  const { secretKey } = config.captcha;
  const query = stringify({
    secret: secretKey,
    response: captcha,
  });
  const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;
  const body = await fetch(verifyURL).then((response) => response.json());
  return body.success;
};
module.exports = validateCaptcha;
