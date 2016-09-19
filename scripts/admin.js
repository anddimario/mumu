/*
 * This script create an admin
 * Run this script from web console with this payload format:
 * {"username": "...", "email": "....", "password": "...", "role": "superadmin"}
 */
 
'use strict';
const argv = module.context.argv;
const db = require('@arangodb').db;
const documentCollections = ["users", "admins"];
const edgeCollections = [];
const createAuth = require('@arangodb/foxx/auth');
const auth = createAuth();

const admins = module.context.collectionName("admins");

if (argv.length === 1) {
  if ((argv[0].role === "admin") || (argv[0].role === "superadmin")) {
    // Create basic admin
    const basic_admin = {
      username: argv[0].username,
      email: argv[0].email,
      role: argv[0].role
    };
    basic_admin.authData = auth.create(argv[0].password);
    db._collection(admins).save(basic_admin);
    module.exports = "Created"; // Return back a created message
  } else {
    module.exports = "Wrong role";
  }
} else {
  module.exports = 'Missed something, payload format: {"username": "...", "email": "....", "password": "...", "role": "superadmin"}';
}
