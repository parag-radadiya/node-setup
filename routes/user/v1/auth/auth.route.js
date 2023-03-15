import express from 'express';
import passport from 'passport';
import auth from 'middlewares/auth';
import validate from 'middlewares/validate';
import { authValidation } from 'validations/user';
import { authController } from 'controllers/user';
// import verifyCaptcha from 'middlewares/captcha';
const router = express.Router();
/**
 * Register API
 */
router.post(
  '/register',
  validate(authValidation.register),
  /* verifyCaptcha('captcha'), // we have disable the captcha so that nothing will break in the code. */
  authController.register
);
/**
 * Token-based verification
 * If User did not receive Email during register then call this API Again
 */
router.post('/send-verify-email', validate(authValidation.sendVerifyEmail), authController.sendVerifyEmail);
/**
 * OTP-based verification
 * If User did not receive Email during register then call this API Again
 */
router.post('/send-verify-otp', validate(authValidation.sendVerifyEmail), authController.sendVerifyOtp);
/**
 * OTP-based verification
 * Verify OTP for successfully Signup
 */
router.post('/verify-otp', validate(authValidation.verifyOtp), authController.verifyOtp);
/**
 * Token-based email verification
 * Verify email for successfully SignUp
 */
router.get('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
/**
 * If User is successfully signup and Verified OTP then can login with Credential.
 */
router.post('/login', validate(authValidation.login), authController.login);
/**
 * get the Current LoggedIn UserInfo
 */
router.get('/me', auth(), authController.userInfo);
/**
 * update the Current UserInfo
 */
router.put('/me', auth(), authController.updateUserInfo);
/**
 * OTP-based verification
 * When User Forgot Password call this API and he get the OTP in his Email to reset Password
 */
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
/**
 * Token-based Verification
 * When User Forgot Password call this API, and user get the verification email to reset Password
 */
router.post('/forgot-password-based-on-token', validate(authValidation.forgotPassword), authController.forgotPasswordToken);
/**
 * Token-based Verification
 * verify that code is for changePassword is Valid.
 */
router.post('/verify-reset-code', validate(authValidation.verifyCode), authController.verifyResetCode);
/**
 * OTP-based verification
 * verify that OTP is for changePassword is Valid.
 */
router.post('/verify-reset-otp', validate(authValidation.resetPasswordOtpVerify), authController.resetPasswordOtpVerify);
/**
 * OTP-based verification
 * Reset the password Using the OTP and Email provided by User.
 */
router.post('/reset-password', validate(authValidation.resetPasswordOtp), authController.resetPasswordOtp);
/**
 * Token-based Verification
 * Reset the password Using the Token and Email provided by Use
 */
router.post(
  '/reset-password-based-on-token',
  validate(authValidation.resetPasswordToken),
  authController.resetPasswordToken
);
/**
 * Get the Refresh Token for the User
 */
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
/**
 * Register device token Api
 */
router.post(
  '/register-device-token',
  auth(),
  validate(authValidation.createDeviceToken),
  authController.registerDeviceToken
);
/**
 * Update device token Api
 */
router.post('/update-device-token', auth(), validate(authValidation.updateDeviceToken), authController.updateDeviceToken);
/**
 * Logout the API for the User
 */
router.post('/logout', auth(), validate(authValidation.logout), authController.logout);
/**
 * Facebook login API for the User
 */
router.post(
  '/facebook',
  validate(authValidation.faceBookLogin),
  passport.authenticate('facebook-token', { session: false }),
  authController.socialLogin
);
/**
 * Google login API for the User
 */
router.post(
  '/google',
  validate(authValidation.googleLogin),
  passport.authenticate('google-token', { session: false, json: true }),
  authController.socialLogin
);
/**
 * Apple login API for the User
 */
router.post(
  '/apple',
  validate(authValidation.appleLogin),
  passport.authenticate('apple-verify-token', { session: false, json: true }),
  authController.socialLogin
);
/**
 * Github login API for the User
 */
router.post(
  '/github',
  validate(authValidation.githubLogin),
  passport.authenticate('github', { session: false }),
  authController.socialLogin
);
module.exports = router;
