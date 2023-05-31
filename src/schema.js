const { gql } = require('apollo-server');

const typeDefs = gql`
  interface Paginated {
    pageSize: Int
    pageCount: Int
    resultsCount: Int
    numberOfPages: Int
  }

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

  type UserResults implements Paginated {
    pageSize: Int
    pageCount: Int
    resultsCount: Int
    numberOfPages: Int
    entries: [NuxeoUser]!
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
    stringArrayProperty(xpath: String!): [String]
    booleanProperty(xpath: String!): Boolean
    parent(schemas: [String]): NuxeoDocument
    children(schemas: [String]): DocumentResults!
    relatedDocuments(xpath: String!, schemas: [String]): DocumentResults!
    userProperty(xpath: String!): NuxeoUserProperties
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

  type Schema {
    name: String
    prefix: String
    fieldNames: [String]
  }

  type Type {
    name: String!
    parent: String!
    facets: [String]!
    schemas: [String]!
    schemaObjs: [Schema]!
  }

  type Config {
    schemas: [Schema]!
    schema(name: String!): Schema
    types: [Type]!
    type(name: String!): Type
  }

  type Query {
    me: NuxeoUserProperties!
    user(ref: String!): NuxeoUserProperties
    userSearch(query: String!): UserResults
    document(ref: String!, schemas: [String]): NuxeoDocument
    directory(id: String!): Directory
    config: Config!
  }
`;

module.exports = typeDefs;
