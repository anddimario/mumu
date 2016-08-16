/*global describe, it */
'use strict';
const expect = require('chai').expect;
const users_routes = require('../routes/users');

const mainSite = module.context.configuration.sites.hostnames[0];
const payload_create = {
  username: "test",
  password: "test",
  hostname: mainSite,
  email: "test@example.com"
};
const payload_password = {
  old: "test",
  new: "prova"
};

describe('user', function () {
  it('create', function () {
    let response = users_routes.create(payload_create, mainSite);
    console.log(response)
    expect(response.success).to.equal(true);
  });
  it('get', function () {
    let response = users_routes.get(payload_create.username, mainSite);
    console.log(response)
    expect(response.success).to.equal(true);
  });
  it('login', function () {
    let response = users_routes.get(payload_create, mainSite);
    console.log(response)
    expect(response.success).to.equal(true);
  });
  it('update', function () {
    let response = users_routes.update(payload_create.email, mainSite);
    console.log(response)
    expect(response.success).to.equal(true);
  });
  it('update password', function () {
    let response = users_routes.update_password(payload_create.email, mainSite);
    console.log(response)
    expect(response.success).to.equal(true);
  });
  it('password token', function () {
    let response = users_routes.password_token(payload_create.email, mainSite);
    console.log(response)
    expect(response.success).to.equal(true);
  });
  it('password reset', function () {
    let response = users_routes.password_reset(payload_create.email, mainSite);
    console.log(response)
    expect(response.success).to.equal(true);
  });
  it('delete', function () {
    let response = users_routes.delete(payload_create.username, mainSite);
    console.log(response)
    expect(response.success).to.equal(true);
  });
});
