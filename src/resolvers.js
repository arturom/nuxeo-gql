const _ = require('lodash');
const { UserInputError } = require('apollo-server');

const resolveDocumentProperty = (doc, { xpath }) => doc.get(xpath);

function init(nuxeo) {
  return {
    Query: {
      me: () => nuxeo.user.properties,
      user: (_, { ref }) =>
        nuxeo
          .users()
          .fetch(ref)
          .then(({ properties }) => properties),
      userSearch: (_, { query }) => nuxeo.request(`user/search`).queryParams({ q: query }).get(),
      document: (_, { ref, schemas }) => nuxeo.repository().fetch(ref, { schemas }),
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
          .request('config/schemas/')
          .get()
          .then((schemas) =>
            schemas.map((schema) => ({
              ...schema,
              fieldNames: Object.keys(schema.fields),
            }))
          );

        const schemasDictPromise = schemasPromise.then((schemas) => _.keyBy(schemas, 'name'));

        const typesDictPromise = nuxeo
          .request('config/types/')
          .get()
          .then(({ doctypes }) =>
            _.mapValues(doctypes, (docType, name) => ({
              ...docType,
              name: name,
              schemaObjs: () =>
                schemasDictPromise.then((dict) => docType.schemas.map((schemaName) => dict[schemaName])),
            }))
          );

        return {
          schemas: schemasPromise,
          schema: ({ name }) => schemasDictPromise.then((dict) => dict[name]),
          types: () => typesDictPromise.then((dict) => Object.values(dict)),
          type: ({ name }) => typesDictPromise.then((dict) => dict[name]),
        };
      },
    },
    NuxeoDocument: {
      intProperty: resolveDocumentProperty,
      stringProperty: resolveDocumentProperty,
      stringArrayProperty: resolveDocumentProperty,
      booleanProperty: resolveDocumentProperty,
      parent: (doc, { schemas }) => nuxeo.repository().fetch(doc.parentRef, { schemas }),
      children: (doc, { schemas }) => {
        const query = `SELECT * FROM Document WHERE ecm:parentId = '${doc.uid}'`;
        return nuxeo.repository('default').query({ query, queryLanguage: 'NXQL' }, { schemas });
      },
      relatedDocuments: (doc, { xpath, schemas }) => {
        const ids = doc.get(xpath);
        if (!ids) {
          return null
        } else if (!ids.length) {
          return [];
        }
        const query = `SELECT * FROM DOCUMENT WHERE ecm:uuid IN (${ids.map((id) => `'${id}'`).join(', ')})`;
        return nuxeo.repository('default').query({ query, queryLanguage: 'NXQL' }, { schemas });
      },
      userProperty: (doc, {xpath}) => {
        const username = doc.get(xpath);
        if (!username) {
          return null;
        }
        return nuxeo.users().fetch(username).then(({ properties }) => properties);
      }
    },
  };
}

module.exports = init;
