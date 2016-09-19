/*global describe, it */
'use strict';

const expect = require('chai').expect;
const contents_routes = require('../routes/contents');
const contents = module.context.collection('contents');

const mainSite = module.context.configuration.sites.hostnames[0];
const payload_create = {
  slug: "test-slug",
  content: "test content<br>",
  type: "article",
  write: "writer,publisher"
};

describe('content', function () {
  
  it('create', function () {
    let response = contents_routes.create("test", payload_create, mainSite);
    expect(response.type).to.equal("success");
  }); 
  
  it('get', function () {
    let response = contents_routes.get(payload_create.slug, mainSite);
    expect(response.type).to.equal("success");
  }); 
  
  // After all tests
  after('delete the created content', function () {
    contents.removeByExample({
      hostname: mainSite,
      slug: payload_create.slug
    });
  });
  
});
