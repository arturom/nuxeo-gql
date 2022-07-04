const { UserInputError } = require('apollo-server');

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
      document: (_, { ref }) => nuxeo.repository().fetch(ref).then(transformDocument),
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
    },
  };
}

module.exports = init;
