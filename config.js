const { NUXEO_HOST, NUXEO_USER, NUXEO_PASSWORD } = process.env;

module.exports = {
  baseURL: NUXEO_HOST || "http://localhost:8080/nuxeo",
  auth: {
    method: "basic",
    username: NUXEO_USER || "Administrator",
    password: NUXEO_PASSWORD || "Administrator",
  },
};
