const { keyBy, mapValues } = require("lodash");
const { UserInputError } = require("@apollo/server");
const DataLoader = require("dataloader");

const resolveDocumentProperty = (doc, { xpath }) => doc.get(xpath);

module.exports = {
  Query: {
    me: (_parent, _args, { nuxeo }) => nuxeo.user.properties,
    user: (_, { ref }, { nuxeo }) =>
      nuxeo
        .users()
        .fetch(ref)
        .then(({ properties }) => properties),
    userSearch: (_, { query }, { nuxeo }) =>
      nuxeo.request(`user/search`).queryParams({ q: query }).get(),
    document: (_, { ref, schemas }, { nuxeo }) =>
      nuxeo.repository().fetch(ref, { schemas }),
    directories: ((_a, _b, {nuxeo}) => 
      nuxeo.request(`directory`).get().then((res) => res.entries)
    ),
    directory: (_, { id }, { nuxeo }) => {
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
    config: (_parent, _args, { nuxeo }) => {
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
        keyBy(schemas, "name")
      );

      const typesDictPromise = nuxeo
        .request("config/types/")
        .get()
        .then(({ doctypes }) =>
          mapValues(doctypes, (docType, name) => ({
            ...docType,
            name: name,
            schemaObjs: () =>
              schemasDictPromise.then((dict) =>
                docType.schemas.map((schemaName) => dict[schemaName])
              ),
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
    parent: (doc, { schemas }, { nuxeo }) =>
      nuxeo.repository().fetch(doc.parentRef, { schemas }),
    children: (doc, { schemas }, { nuxeo }) => {
      const query = `SELECT * FROM Document WHERE ecm:parentId = '${doc.uid}'`;
      return nuxeo
        .repository("default")
        .query({ query, queryLanguage: "NXQL" }, { schemas });
    },
    relatedDocuments: (doc, { xpath, schemas }, { nuxeo }) => {
      const ids = doc.get(xpath);
      if (!ids) {
        return null;
      } else if (!ids.length) {
        return [];
      }
      const query = `SELECT * FROM DOCUMENT WHERE ecm:uuid IN (${ids
        .map((id) => `'${id}'`)
        .join(", ")})`;
      return nuxeo
        .repository("default")
        .query({ query, queryLanguage: "NXQL" }, { schemas });
    },
    userProperty: (doc, { xpath }, { nuxeo }) => {
      const username = doc.get(xpath);
      if (!username) {
        return null;
      }
      return nuxeo
        .users()
        .fetch(username)
        .then(({ properties }) => properties);
    },
  },
};
