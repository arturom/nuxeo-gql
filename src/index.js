const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const Nuxeo = require('nuxeo');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const config = require('../config');

async function main() {
  const nuxeo = await new Nuxeo(config).connect();

  const server = new ApolloServer({
    typeDefs,
    resolvers: resolvers(nuxeo),
    csrfPrevention: true,
    cache: 'bounded',
  });

  const { url } = await startStandaloneServer(server);
  console.log(`🚀  Server ready at ${url}`);
}

main();
