const config = {
  default: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_DIALECT || 'postgres',
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
  },
  development: {
    username: 'postgres',
    password: '12345678',
    extend: 'default',
    database: process.env.DB_NAME || 'geodistance',
  },
  test: {
    username: 'postgres',
    password: '12345678',
    extend: 'default',
    database: 'geodistance',
  },
  production: {
    username: process.env.USERNAME ||'postgres',
    password: process.env.PASSWORD || '12345678',
    extend: 'default',
    database: process.env.DB_NAME || 'geodistance',
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.HOST || '',
    dialectOptions: {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      },
    },
    options: {
      dialect: 'postgres',
    },
    use_env_variable: 'DATABASE_URL',
  },
};

Object.keys(config).forEach((configKey) => {
  const configValue = config[configKey];
  if (configValue.extend) {
    config[configKey] = { ...config[configValue.extend], ...configValue };
  }
});

module.exports = config;
