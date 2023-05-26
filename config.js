const { NUXEO_HOST, NUXEO_USER, NUXEO_PASSWORD } = process.env;

const credentials = {
  localhost: {
    baseURL: NUXEO_HOST || 'http://localhost:8080/nuxeo',
    auth: {
      method: 'basic',
      username: NUXEO_USER || 'Administrator',
      password: NUXEO_PASSWORD || 'Administrator',
    },
  },
};

module.exports = credentials.localhost;
