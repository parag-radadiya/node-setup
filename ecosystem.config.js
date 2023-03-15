module.exports = {
  apps: [
    {
      name: 'app',
      script: './build/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
