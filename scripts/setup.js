'use strict';
const db = require('@arangodb').db;
const documentCollections = ["users", "admins"];
const edgeCollections = [];
const createAuth = require('@arangodb/foxx/auth');
const auth = createAuth();

for (const localName of documentCollections) {
  const qualifiedName = module.context.collectionName(localName);
  if (!db._collection(qualifiedName)) {
    db._createDocumentCollection(qualifiedName);
  } else if (module.context.isProduction) {
    console.warn(`collection ${qualifiedName} already exists. Leaving it untouched.`)
  }
}

for (const localName of edgeCollections) {
  const qualifiedName = module.context.collectionName(localName);
  if (!db._collection(qualifiedName)) {
    db._createEdgeCollection(qualifiedName);
  } else if (module.context.isProduction) {
    console.warn(`collection ${qualifiedName} already exists. Leaving it untouched.`)
  }
}

// Create indexes
const users = module.context.collectionName("users"); // need to define the context otherwise it refers to a general collection
db._collection(users).ensureIndex({
  type: 'hash',
  fields: ['username'],
  unique: true
});
const admins = module.context.collectionName("admins"); // need to define the context otherwise it refers to a general collection
db._collection(admins).ensureIndex({
  type: 'hash',
  fields: ['username'],
  unique: true
});
// Create basic admin
const basic_admin = {
  username: "admin",
  email: "test@example.com"
};
basic_admin.authData = auth.create("admin");
db._collection(admins).save(basic_admin);
