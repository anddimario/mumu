'use strict';
// Service requirements
const users_routes = require('./routes/users');
const users_models = require('./models/users');
const contents_routes = require('./routes/contents');
const contents_models = require('./models/contents');
const admins_routes = require('./routes/admins');
const check_hostname = require('./middlewares/check_hostname');
const check_admin = require('./middlewares/check_admin');

// Global requirements
const joi = require('joi');
const createRouter = require('@arangodb/foxx/router');
const sessionsMiddleware = require('@arangodb/foxx/sessions');
const jwtStorage = require('@arangodb/foxx/sessions/storages/jwt');

// Pass in a secure secret from the Foxx configuration
const secret = module.context.configuration.jwtSecret;
const sessions = sessionsMiddleware({
  storage: jwtStorage(secret),
  transport: 'header'
});
module.context.use(sessions);

/* Middlewares */
module.context.use(function (req, res, next) {
  let valid = check_hostname(req.hostname);
  if (valid.type === "error") {
    res.throw(404, 'Not found');
  }
  next();
});
// This middleware is used to check admin/superadmin access for a site
module.context.use(function(req, res, next){
  var path_root = req.path.split("/");
  path_root = path_root.filter(function(e){return e}); // remove empty value
  if (path_root[0] === "admin") {
    let valid = check_admin(req.session.data.username, req.hostname);
    if (valid.type === "error") {
      res.throw('unauthorized');
    }
    next();
  } else {
    next();
  }
});

const router = createRouter();
module.context.use(router);

/* Users */
// Login
router.post('/login', function (req, res) {
  let results = users_routes.login(req.body, req.hostname);
  if (results.type === "success") {
    // Log the user in, store the session, the response gave back the token in X-Session-Id
    req.session.uid = results.details._key;
    req.session.data = {username: results.details.username};
    res.send({success: true});
  } else {
    res.throw('unauthorized');
  }
})
.body(joi.object(users_models.login).required(), 'Credentials')
.description('Login.');

// Get the user informations (if logged in)
router.get('/users', function (req, res) {
  let informations = users_routes.get(req.session.data.username, req.hostname);
  if (informations.type === "success") {
    res.send({success: true, user: informations.details});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.description('Get informations about the logged user.');

// Create the user
router.post('/users', function (req, res) {
  let creation = users_routes.create(req.body, req.hostname);
  if (creation.type === "success") {
    // Log the user in, store the session, the response gave back the token in X-Session-Id
    req.session.uid = creation.details._key;
    req.session.data = {username: results.details.username};
    res.send({success: true});
  } else {
    // Failed to save the user
    // We'll assume the UniqueConstraint has been violated
    res.throw('bad request', creation.details);
  }
})
.body(joi.object(users_models.create).required(), 'Credentials')
.description('Creates a new user and return the token.');

// Update User, user can update only himself
router.put('/users', function (req, res) {
  let results = users_routes.update(req.session.data.username, req.body, req.hostname);
  if (results.type === "success") {
    res.send({success: true});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.body(joi.object(users_models.update).required())
.description('Update the user, user can update only himself.');

// Delete User, user can delete only himself
router.delete('/users', function (req, res) {
  let results = users_routes.delete(req.session.data.username, req.hostname);
  if (results.type === "success") {
    res.send({success: true});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.description('Delete the user, user can delete only himself.');

// Password reset token, set token
router.post('/users/password/token', function (req, res) {
  let results = users_routes.password_token(req.body.username, req.hostname);
  if (results.type === "success") {
    res.send({success: true});
  } else {
    res.throw(400, 'Not found');
  }
})
.body(joi.object(users_models.password_token).required(), 'Credentials')
.summary("This method don't send email, but only set the token in the user collection, with a reset_password_timestamp that define the request timestamp")
.description('Password reset token, set token.');

// Password reset
router.post('/users/password/reset', function (req, res) {
  let results = users_routes.password_reset(req.body, req.hostname);
  if (results.type === "success") {
    res.send({success: true});
  } else {
    res.throw(400, 'Not found');
  }
})
.body(joi.object(users_models.password_reset).required(), 'Credentials')
.summary("Use the token to set the new password, token older than two days is set as expired af")
.description('Password reset.');

// Password update, user can update only himself
router.put('/users/password', function (req, res) {
  let results = users_routes.update_password(req.session.data.username, req.body, req.hostname);
  if (results.type === "success") {
    res.send({success: true});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.body(joi.object(users_models.update_password).required())
.description('Update the user password, user can update only himself.');

/* Admin */
// Login
router.post('/login', function (req, res) {
  let results = admins_routes.login(req.body, req.hostname);
  if (results.type === "success") {
    // Log the user in, store the session, the response gave back the token in X-Session-Id
    req.session.uid = results.details._key;
    req.session.data = {username: results.details.username};
    res.send({success: true});
  } else {
    res.throw('unauthorized');
  }
})
.body(joi.object(users_models.login).required(), 'Credentials')
.description('Login.');

// Get users list for a site
router.get('/admin/users', function (req, res) {
  let informations = admins_routes.list(req.hostname);
  if (informations.type === "success") {
    res.send({success: true, user: informations.details});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.pathParam('username', joi.string().required())
.description('Get users list.');

// Get user for a site by username
router.get('/admin/users/:username', function (req, res) {
  let informations = users_routes.get(req.params.username, req.hostname);
  if (informations.type === "success") {
    res.send({success: true, user: informations.details});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.pathParam('username', joi.string().required())
.description('Get users list.');

// Update an user, not an admin
router.put('/admin/users/:username', function (req, res) {
  let results = users_routes.update(req.params.username, req.body, req.hostname);
  if (results.type === "success") {
    res.send({success: true});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.body(joi.object(users_models.update).required())
.pathParam('username', joi.string().required())
.description('Update an user, not an admin.');

// Delete an user, not an admin
router.delete('/admin/users/:username', function (req, res) {
  let results = users_routes.delete(req.params.username, req.hostname);
  if (results.type === "success") {
    res.send({success: true});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.pathParam('username', joi.string().required())
.description('Delete an user, not an admin.');

/* Contents */
// Add a content
router.post('/contents', function (req, res) {
  let creation = contents_routes.create(req.session.data.username, req.body, req.hostname);
  if (creation.type === "success") {
    res.send({success: true});
  } else {
    res.throw('bad request', creation.details);
  }
})
.header('X-Session-Id', joi.string().required())
.body(joi.object(contents_models.create).required(), 'Informations')
.description('Add a content, read and write are a list of group that has access to the content, empty value allow access to all');

// Get content by slug
router.get('/contents/:slug', function (req, res) {
  let informations = contents_routes.get(req.params.slug, req.hostname);
  if (informations.type === "success") {
    res.send({success: true, content: informations.details});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.pathParam('slug', joi.string().required())
.description('Get content by slug.');

// Contents list, filter on querystring enabled for owner, all readable, all writeable, content type and date
router.get('/contents', function (req, res) {
  let informations = contents_routes.search(req.session.data.username, req.hostname, req.queryParams);
  if (informations.type === "success") {
    res.send({success: true, content: informations.details});
  } else {
    res.throw('bad request', informations.details);
  }
})
.header('X-Session-Id', joi.string().required())
.queryParam('owner', joi.boolean(), 'Owner')
.queryParam('writeable', joi.boolean(), 'Writeable')
.queryParam('type', joi.string(), 'Type')
.queryParam('start_date', joi.date().timestamp(), 'Start date')
.queryParam('end_date', joi.date().timestamp(), 'End date')
.summary('Filter on querystring enabled for owner {owner: true}, all writeable {writeable: true}, content type {type: "string"} and date {start_date: timestamp_format, end_date: timestamp_format}. If filter is null, show only readable content')
.description('Contents search.');

// Update content by id, if the user is the owner, or an admin/superadmin
router.put('/contents/:id', function (req, res) {
  let results = contents_routes.put(req.session.data.username, req.hostname, req.params.id, req.body);
  if (results.type === "success") {
    res.send({success: true});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.pathParam('id', joi.number().integer().required())
.body(joi.object(contents_models.update).required(), 'Informations')
.description('Remove content by id, if the user is the owner, or an admin/superadmin.')

// Remove content by id, if the user is the owner, or an admin/superadmin
router.delete('/contents/:id', function (req, res) {
  let results = contents_routes.delete(req.session.data.username, req.hostname, req.params.id);
  if (results.type === "success") {
    res.send({success: true});
  } else {
    res.throw(400, 'Not found');
  }
})
.header('X-Session-Id', joi.string().required())
.pathParam('id', joi.number().integer().required())
.description('Remove content by id, if the user is the owner, or an admin/superadmin.');
