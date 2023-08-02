const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const Nuxeo = require("nuxeo");
const { readFileSync } = require('fs')

const resolvers = require("./resolvers");
const config = require("../config");
const typeDefs = readFileSync(require.resolve("./schema.graphqls"), 'utf-8');

async function main() {
  const nuxeo = await new Nuxeo(config).connect();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: "bounded",
  });

  const { url } = await startStandaloneServer(server, {
    context: () => ({
      nuxeo
    }),
  });
  console.log(`🚀  Server ready at ${url}`);
}

main();
