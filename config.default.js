const credentials = {
  localhost: {
    baseURL: 'http://localhost:8080/nuxeo',
    auth: {
      method: 'basic',
      username: 'Administrator',
      password: 'Administrator',
    },
  },
};

module.exports = credentials.localhost;
