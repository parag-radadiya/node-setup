import path from 'path';
import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config({ path: path.join(__dirname, '../.env') });
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    LOG_LEVEL: Joi.string().required().description('log level'),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    FRONT_URL: Joi.string().description('frontend url for email service'),
    REDIS_HOST: Joi.string().required().description('Redis Host is required'),
    REDIS_PORT: Joi.string().required().description('Redis Port is required'),
    REDIS_PASSWORD: Joi.string().required().description('Redis Password is required'),
    AWS_BUCKET_NAME: Joi.string().required().description('Aws Bucket Name is required'),
    AWS_ACCESS_KEY: Joi.string().required().description('Aws Access Key is required'),
    AWS_SECRET_ACCESS_KEY: Joi.string().required().description('Aws Secret Access Key is required'),
    PARTY_USER_LIMIT: Joi.number().default(8),
    RESET_PASSWORD_CODE_SIZE: Joi.number().default(6),
    GOOGLE_CLIENT_ID: Joi.string().required().description('Google Client is required'),
    GOOGLE_CLIENT_SECRET: Joi.string().required().description('Google Client Secret required'),
    CAPTCHA_SECRET_KEY: Joi.string().required().description('Google Captcha Secret Key required'),
    FACEBOOK_CLIENT_ID: Joi.string().required().description('Facebook Client is required'),
    FACEBOOK_CLIENT_SECRET: Joi.string().required().description('facebook Client Secret is required'),
    APPLE_CLIENT_ID: Joi.string().required().description('Apple Client is required'),
    APPLE_TEAM_ID: Joi.string().required().description('Apple TeamId is required'),
    APPLE_KEY_ID: Joi.string().required().description('Apple KeyId is required'),
    GITHUB_CLIENT_ID: Joi.string().required().description('Apple Client is required'),
    GITHUB_CLIENT_SECRET: Joi.string().required().description('Apple TeamId is required'),
    STRIPE_KEY: Joi.string().required().description('Stripe Secret Key required'),
    STRIPE_GATEWAY_ID: Joi.string().required().description('Stripe Gateway Id required'),
  })
  .unknown();
const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: 10,
    verifyEmailExpirationMinutes: 180,
    resetPasswordCodeSize: envVars.RESET_PASSWORD_CODE_SIZE,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  front: {
    url: envVars.FRONT_URL,
  },
  logging: {
    level: envVars.LOG_LEVEL || 'info',
  },
  notification: {
    ttl: 60 * 60 * 24,
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },
  party: {
    limit: envVars.PARTY_USER_LIMIT,
  },
  aws: {
    accessKeyId: envVars.AWS_ACCESS_KEY,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    bucket: envVars.AWS_BUCKET_NAME,
  },
  google: {
    clientID: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  },
  captcha: {
    secretKey: envVars.CAPTCHA_SECRET_KEY,
  },
  facebook: {
    clientID: envVars.FACEBOOK_CLIENT_ID,
    clientSecret: envVars.FACEBOOK_CLIENT_SECRET,
  },
  apple: {
    clientID: envVars.APPLE_CLIENT_ID,
    teamID: envVars.APPLE_TEAM_ID,
    keyId: envVars.APPLE_KEY_ID,
  },
  github: {
    clientID: envVars.GITHUB_CLIENT_ID,
    clientSecret: envVars.GITHUB_CLIENT_SECRET,
  },
  stripe: {
    key: envVars.STRIPE_KEY,
    gatewayId: envVars.STRIPE_GATEWAY_ID,
  },
};
