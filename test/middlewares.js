/*global describe, it */
'use strict';

const createAuth = require('@arangodb/foxx/auth');
const auth = createAuth();
const expect = require('chai').expect;
const check_hostname = require('../middlewares/check_hostname');
const check_admin = require('../middlewares/check_admin');
const admins = module.context.collection('admins');

const mainSite = module.context.configuration.sites.hostnames[0];
const payload_admin = {
  username: "admin_middleware",
  hostname: mainSite,
  role: "admin",
  password: "test"
};
const payload_superadmin = {
  username: "superadmin_middleware",
  hostname: mainSite,
  role: "superadmin",
  password: "test"
};

describe('middlewares', function () {
  // Before all tests
  before('create a superadmin', function () {
    let superadmin = payload_superadmin;
    superadmin.authData = auth.create(superadmin.password);
    delete superadmin.password;
    admins.save(superadmin);
  });
  before('create an admin', function () {
    let admin = payload_admin;
    admin.authData = auth.create(admin.password);
    delete admin.password;
    admins.save(admin);
  });  
  
  it('check admin with allowed hostname', function () {
    let response = check_admin(payload_admin.username, mainSite);
    expect(response.type).to.equal("success");
  });  
  it('check admin with not allowed hostname', function () {
    let response = check_admin(payload_admin.username, "example.com");
    expect(response.type).to.equal("error");
  });  
  it('check superadmin', function () {
    let response = check_admin(payload_superadmin.username, mainSite);
    expect(response.type).to.equal("success");
  });
  it('check superadmin with a second hostname', function () {
    let response = check_admin(payload_superadmin.username, "example.com");
    expect(response.type).to.equal("success");
  });
  it('check a valid hostname', function () {
    let response = check_hostname(mainSite);
    expect(response.type).to.equal("success");
  });
  it('check an invalid hostname', function () {
    let response = check_hostname("example.com");
    expect(response.type).to.equal("error");
  });
  
  // After all tests
  after('delete the created superadmin', function () {
    admins.removeByExample({
      hostname: mainSite,
      username: payload_superadmin.username
    });
  });
  after('delete the created admin', function () {
    admins.removeByExample({
      hostname: mainSite,
      username: payload_admin.username
    });
  });
});
