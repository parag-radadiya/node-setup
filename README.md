# demo-project
___
demo-project\
This is a server-side application in Node.js using Express web application framework and and Mongoose ODM, generated using Appinvento.

## Requirements
___

- **Node.js** : Node.js is an open-source server environment. Node.js is cross-platform and runs on Windows, Linux, Unix, and macOS. Node.js is a back-end JavaScript runtime environment.
- **MongoDB** : MongoDB is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas.
- **Redis** : Redis is an open source, in-memory data structure store used as a database, cache, message broker, and streaming engine
- **Docker** : Docker is a set of platform as a service products that use OS-level virtualization to deliver software in packages called containers. The service has both free and premium tiers.
               The software that hosts the containers is called Docker Engine.

## Features
___

| Feature                          | Summary                                                                                                                                                                                    |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Authentication via JsonWebToken | Supports authentication using [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken).  |
| Code Linting                    | JavaScript code linting is done using [ESLint](http://eslint.org) - a pluggable linter tool for identifying and reporting on patterns in JavaScript.|
| Auto server restart             | Restart the server using [nodemon](https://github.com/remy/nodemon) in real-time anytime an edit is made, with babel compilation and eslint.|
| Express                         | [Express](https://www.npmjs.com/package/express) is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.|

## Getting Started
___

**Install dependencies**:
```sh
npm install
```

**Start server**:
```sh
npm run dev-es6
```

Or

`open package.json file and run dev-es6 script`


## .env file
```
File is placed at the base of the project directory and contains all necessary variables for application
like port number, database url and different credentials.
```

```
# Kindly replace below values with your credentials.

# Port Number for running server
PORT=3000

# MongoDB database url
MONGODB_URL=mongodb://127.0.0.1:27017/fosocial


# Password Authentication using JWT
# JWT Secret for creating and verifing access token
JWT_SECRET=QDw^d2+qu/!2?~Uf

# Access Token Expiration in minutes
JWT_ACCESS_EXPIRATION_MINUTES=30

# Refresh Token Expiration in days
JWT_REFRESH_EXPIRATION_DAYS=30


# SMTP configuration options for the email service
# the hostname or IP address and the port to connect to (defaults to ‘localhost’)
SMTP_HOST=email-server
SMTP_PORT=587

# the username and password for authentication object used in SMTP connection data
SMTP_USERNAME=email-server-username
SMTP_PASSWORD=email-server-password

# Email id from whom email is being sent
EMAIL_FROM=support@yourapp.com

# Base url for email verification url in verification email
FRONT_URL=frontend-url


# Redis connection options for creating redis client instance
# it will connect to localhost:6379 (hostName:port)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=root


# Authentication via Google
# Options specifying a app clinet ID and app client secret for google strategy
GOOGLE_CLIENT_ID=google_client_id
GOOGLE_CLIENT_SECRET=google_client_secret


# Authentication via FaceBook
# Options specifying a app clinet ID and app client secret for FaceBook strategy
FACEBOOK_CLIENT_ID=facebook_client_id
FACEBOOK_CLIENT_SECRET=facebook_client_secret


# Authentication via Apple
# Options specifying a app clinet ID that accesses the backend for Apple token strategy
APPLE_CLIENT_ID=apple_client_id
APPLE_TEAM_ID=apple_team_id
APPLE_KEY_ID=apple_key_id


# Authentication via GitHub
# Options specifying a client ID, client secret for GitHub strategy
GITHUB_CLIENT_ID=github_client_id
GITHUB_CLIENT_SECRET=github_team_id


# Stripe for Payment service
# Stripe account's secret key for stripe module configuration
STRIPE_KEY=stripe_key
STRIPE_GATEWAY_ID=stripe_gateway_id


# Captcha for verifing the human identity
# Captcha secret key for validating Captcha
CAPTCHA_SECRET_KEY=captcha_secret_key


# Logger Utility - log messages for the system
# Level of the message logging while createLogger using winston
LOG_LEVEL=log_level


# File-upload service Via AWS provider
# the Bucket name
AWS_BUCKET_NAME=aws_bucket_name

# accessKeyId and secretAccessKey that authorize your access to services.
AWS_ACCESS_KEY=aws_access_key
AWS_SECRET_ACCESS_KEY=aws_secret_access_key

# The Bucket Region in which you will request services.
AWS_BUCKET_REGION=bucket_region

```

## Project Structure
___

```
   ├── config            -  contains config files.
   ├── controllers       -  Controller files calls appropriate service functions.
   ├── docs              -  contains postman collection
   ├── middlewares       -  contains middleware files.
   ├── models            -  Model files contain schema for model.
   ├── routes            -  Route files contain all the routes
   ├── services          -  Service files contain execution logic for a single web route only.
   ├── utils             -  contains utils files.
   ├── validations       -  Joi validations schema files for each route api.
```

## Flow of code
___

- **Routes** : index.js file exports all model routes from all userRoles, imported into app.js to access all the routes.
```
    ├── routes
       ├── user
           ├── v1
              ├── auth
                 ├── auth.route.js   - contains CRUD operation for auth routes
             ├── user
                 ├── user.route.js   - contains CRUD operation for user model routes
           └── index.js               - exports all models routes
    └── index.js                     - exports all userRole routes
```
- **Validations**: Joi validations schema files for each route api.
```
   ├── validations
      ├── user
         ├── auth.validation.js   - contains all validation schema of auth route
         ├── user.validation.js   - contains all validation schema of user model route
       └── index.js                - exports all validation schemas
```
- **Controllers**: Controller files calls appropriate service functions.
```
  ├── controllers
     ├── user
        ├── auth.controller.js   - contains all controller functions of auth route
        ├── user.controller.js   - contains all controller function of user model route
      └── index.js                - exports all controller functions
```
- **Services**: Service files contains execution logic for a single web route only.
```
  ├── services
     ├── auth.service.js      - contains all service functions of auth route
     ├── user.controller.js   - contains all service function of user model route
   └── index.js                - exports all service functions
```
- **Models**: Model files contains schema for model.

