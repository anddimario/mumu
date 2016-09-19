/*global describe, it */
'use strict';

const createAuth = require('@arangodb/foxx/auth');
const auth = createAuth();
const expect = require('chai').expect;
const users_routes = require('../routes/users');
const users = module.context.collection('users');

const mainSite = module.context.configuration.sites.hostnames[0];
const payload_create = {
  username: "test",
  password: "test",
  email: "test@example.com",
  hostname: mainSite,
  role: "user"
};
const payload_password = {
  old: "test",
  new: "prova"
};
const payload_delete = {
  username: "test_delete",
  hostname: mainSite,
  role: "user",
  password: "test"
};

describe('user', function () {
  // Before all tests
  before('create a test user for delete', function () {
    let user = payload_delete;
    user.authData = auth.create(user.password);
    delete user.password;
    users.save(user);
  });
  
  it('create', function () {
    let response = users_routes.create(payload_create, mainSite);
    expect(response.type).to.equal("success");
  });  
  it('get', function () {
    let response = users_routes.get(payload_create.username, mainSite);
    expect(response.type).to.equal("success");
  });
  it('login', function () {
    let response = users_routes.login({
      username: payload_create.username, 
      password: "test"
    }, mainSite);
    expect(response.type).to.equal("success");
  });
  it('update', function () {
    let response = users_routes.update(payload_create.email, {email: "new@example.com"}, mainSite);
    expect(response.type).to.equal("success");
  });
  it('update password', function () {
    let response = users_routes.update_password(payload_create.username, payload_password, mainSite);
    expect(response.type).to.equal("success");
  });
  it('password token', function () {
    let response = users_routes.password_token(payload_create.username, mainSite);
    expect(response.type).to.equal("success");
  });
  it('password reset', function () {
    // Get the user for the token
    let user = users.firstExample({
      hostname: mainSite,
      username: payload_create.username
    });
    let response = users_routes.password_reset({token: user.reset_password_token}, mainSite);
    expect(response.type).to.equal("success");
  });
  it('delete', function () {
    let response = users_routes.delete(payload_delete.username, mainSite);
    expect(response.type).to.equal("success");
  });
  
  // After all tests
  after('delete the created user', function () {
    users.removeByExample({
      hostname: mainSite,
      username: payload_create.username
    });
  });
});
