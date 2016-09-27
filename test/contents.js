/*global describe, it */
'use strict';

const expect = require('chai').expect;
const contents_routes = require('../routes/contents');
const contents = module.context.collection('contents');
const createAuth = require('@arangodb/foxx/auth');
const auth = createAuth();
const users = module.context.collection('users');

const mainSite = module.context.configuration.sites.hostnames[0];
const payload_create = {
  slug: "test-slug",
  content: "test content<br>",
  type: "article",
  owner: "test_contents",
  write: "writer,publisher"
};
const payload_update = {
  slug: "test-new-slug",
  content: "test new content<br>"
};

const fake_contents = [
  {
    slug: "test1-slug",
    hostname: mainSite,
    content: "test1 content<br>",
    type: "article",
    owner: "test_contents",
    write: ["writer","publisher"],
    created_at: 1454284800000,
    fake: true
  },
  {
    slug: "test2-slug",
    hostname: mainSite,
    content: "test2 content<br>",
    type: "page",
    owner: "test_contents",
    created_at: 1456790400000,
    read: ["writer"],
    write: ["writer"],
    fake: true
  },
  {
    slug: "test3-slug",
    hostname: mainSite,
    content: "test3 content<br>",
    owner: "test_contents",
    created_at: 1459468800000,
    type: "news",
    fake: true
  },
  {
    slug: "test4-slug",
    hostname: mainSite,
    content: "test4 content<br>",
    type: "page",
    owner: "test_contents",
    created_at: 1462060800000,
    read: ["writer"],
    write: ["writer"],
    fake: true
  }
];
const payload_user = {
  username: "test_contents",
  hostname: mainSite,
  role: "publisher",
  password: "test"
};

describe('content', function () {
  
  before('create a test user for search', function () {
    let user = payload_user;
    user.authData = auth.create(user.password);
    delete user.password;
    users.save(user);
  });
  before('create all fake contents for search', function () {
    for (let i = 0; i < fake_contents.length; i++) {
      contents.save(fake_contents[i]);
    }
  });
  
  it('create', function () {
    let response = contents_routes.create(payload_user.username, payload_create, mainSite);
    expect(response.type).to.equal("success");
  }); 
  
  it('get', function () {
    let response = contents_routes.get(payload_create.slug, mainSite);
    expect(response.type).to.equal("success");
  }); 
  
  it('search without filters', function () {
    let response = contents_routes.search(payload_user.username, mainSite, null);
    expect(response.type).to.equal("success");
  }); 
  
  it('search by owner', function () {
    let response = contents_routes.search(payload_user.username, mainSite, {owner: true});
    expect(response.type).to.equal("success");
  });   
  
  it('search writeable', function () {
    let response = contents_routes.search(payload_user.username, mainSite, {writeable: true});
    expect(response.type).to.equal("success");
  }); 
  
  it('search type article', function () {
    let response = contents_routes.search(payload_user.username, mainSite, {type: "article"});
    expect(response.type).to.equal("success");
  }); 
  
  it('search by date range', function () {
    let response = contents_routes.search(payload_user.username, mainSite, {start_date: 1456790400000, end_date: 1462060800000});
    expect(response.type).to.equal("success");
  }); 
  
  it('update content', function () {
    let get_content = contents_routes.get(payload_create.slug, mainSite);
    let response = contents_routes.update(payload_user.username, mainSite, get_content.details._id, payload_update);
    console.log(response)
    expect(response.type).to.equal("success");
  }); 
  
  it('delete content', function () {
    let get_content = contents_routes.get(payload_update.slug, mainSite);
    let response = contents_routes.delete(payload_user.username, mainSite, get_content.details._id);
    console.log(response)
    expect(response.type).to.equal("success");
  }); 
  
  // After all tests
  /*after('delete the created content', function () {
    contents.removeByExample({
      hostname: mainSite,
      slug: payload_create.slug
    });
  });*/
  after('delete the fake contents', function () {
    contents.removeByExample({
      hostname: mainSite,
      fake: true
    });
  });
  after('delete the created user', function () {
    users.removeByExample({
      hostname: mainSite,
      username: payload_user.username
    });
  });
  
});
