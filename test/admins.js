/*global describe, it */
'use strict';

const createAuth = require('@arangodb/foxx/auth');
const auth = createAuth();
const expect = require('chai').expect;
const admins_routes = require('../routes/admins');
const users = module.context.collection('users');
const admins = module.context.collection('admins');

const mainSite = module.context.configuration.sites.hostnames[0];
const payload_login = {
  username: "admin",
  password: "test"
};
const payload_user = {
  username: "test_admin",
  hostname: mainSite,
  role: "user",
  password: "test"
};
const payload_admin = {
  username: "admin",
  hostname: mainSite,
  role: "admin",
  password: "test"
};

describe('admin', function () {
  // Before all tests
  before('create a test user for list', function () {
    let user = payload_user;
    user.authData = auth.create(user.password);
    delete user.password;
    users.save(user);
  });
  before('create an admin', function () {
    let admin = payload_admin;
    admin.authData = auth.create(admin.password);
    delete admin.password;
    admins.save(admin);
  });  
  
  it('login', function () {
    let response = admins_routes.login(payload_login, mainSite);
    expect(response.type).to.equal("success");
  });
  it('list', function () {
    let response = admins_routes.list(mainSite);
    expect(response.type).to.equal("success");
  });
  
  // After all tests
  after('delete the created user', function () {
    users.removeByExample({
      hostname: mainSite,
      username: payload_user.username
    });
  });
  after('delete the created admin', function () {
    admins.removeByExample({
      hostname: mainSite,
      username: payload_admin.username
    });
  });
});
