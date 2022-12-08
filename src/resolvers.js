const _ = require('lodash');
const { UserInputError } = require('apollo-server');

function debugLog(x) {
  console.log(x);
  return x;
}

function init(nuxeo) {
  const transformDocument = function (doc) {
    return {
      ...doc,
      intProperty: (_, { xpath }) => doc.get(xpath),
      stringProperty: (_, { xpath }) => doc.get(xpath),
      booleanProperty: (_, { xpath }) => doc.get(xpath),
      children: () => {
        const query = `SELECT * FROM Document WHERE ecm:parentId = '${doc.uid}'`;
        return nuxeo
          .repository('default')
          .query({ query, queryLanguage: 'NXQL' })
          .then((results) => ({
            ...results,
            entries: results.entries.map(transformDocument),
          }));
      },
    };
  };

  return {
    Query: {
      me: () => nuxeo.connect().then((x) => x.user),
      user: (_, { ref }) => nuxeo.users().fetch(ref),
      document: (_, { ref }) =>
        nuxeo.repository().fetch(ref).then(transformDocument),
      directory: (_, { id }) => {
        const directory = nuxeo.directory(id);
        return {
          name: directory._directoryName,
          entry: (_, { id: entryID }) => directory.fetch(entryID),
          entries: () =>
            directory.fetchAll().catch((e) => {
              throw new UserInputError(e.statusText);
            }),
        };
      },
      config: () => {
        const schemasPromise = nuxeo
          .request("config/schemas/")
          .get()
          .then((schemas) =>
            schemas.map((schema) => ({
              ...schema,
              fieldNames: Object.keys(schema.fields),
            }))
          );

        const schemasDictPromise = schemasPromise.then((schemas) =>
          _.keyBy(schemas, "name")
        );

        const typesDictPromise = nuxeo.request("config/types/").get()
          .then(({ doctypes }) =>
            _.mapValues(doctypes, (docType, name) => ({
              ...docType,
              name: name,
              schemaObjs: () =>
                schemasDictPromise.then((dict) =>
                  docType.schemas.map((schemaName) => dict[schemaName])
                ),
            }))
          )


        return {
          schemas: schemasPromise,
          schema: ({ name }) => schemasDictPromise.then((dict) => dict[name]),
          types: () => typesDictPromise.then((dict) => Object.values(dict)),
          type: ({ name }) => typesDictPromise.then((dict) => dict[name]),
        };
      }
    }
  }
}

module.exports = init;
