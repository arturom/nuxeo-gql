const { gql } = require('apollo-server');

const typeDefs = gql`
  type NuxeoUserProperties {
    firstName: String
    lastName: String
    groups: [String]!
    company: String
    email: String!
    username: String!
  }

  type NuxeoUser {
    properties: NuxeoUserProperties
  }

  interface Paginated {
    pageSize: Int
    pageCount: Int
    resultsCount: Int
    numberOfPages: Int
  }

  type DocumentResults implements Paginated {
    pageSize: Int
    pageCount: Int
    resultsCount: Int
    numberOfPages: Int
    entries: [NuxeoDocument]!
  }

  type NuxeoDocument {
    uid: ID!
    path: String!
    state: String
    type: String!
    isCheckedOut: Boolean
    isVersion: Boolean
    isProxy: Boolean
    isTrashed: Boolean
    title: String
    repository: String!
    facets: [String]!
    parentRef: String!
    intProperty(xpath: String!): Int
    stringProperty(xpath: String!): String
    booleanProperty(xpath: String!): Boolean
    children: DocumentResults!
  }

  type DirectoryEntryProperties {
    id: ID!
    label: String!
    ordering: Int
    obsolete: Int
  }

  type DirectoryEntry {
    id: ID!
    directoryName: String
    properties: DirectoryEntryProperties
  }

  type DirectoryResults implements Paginated {
    pageSize: Int
    pageCount: Int
    resultsCount: Int
    numberOfPages: Int
    entries: [DirectoryEntry]!
  }

  type Directory {
    name: String!
    entry(id: ID): DirectoryEntry
    entries: DirectoryResults!
  }

  type Query {
    me: NuxeoUser
    user(ref: String!): NuxeoUser
    document(ref: String!): NuxeoDocument
    directory(id: String!): Directory
  }
`;

module.exports = typeDefs;
