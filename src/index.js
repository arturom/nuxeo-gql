const { ApolloServer } = require('apollo-server');
const Nuxeo = require('nuxeo');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const config = require('../config');

const nuxeo = new Nuxeo(config);

const server = new ApolloServer({
  typeDefs,
  resolvers: resolvers(nuxeo),
  csrfPrevention: true,
  cache: 'bounded',
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
