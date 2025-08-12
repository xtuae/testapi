// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3001',
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://your-production-api.com',
  },
};

const environment = process.env.NODE_ENV || 'development';

export default config[environment];
