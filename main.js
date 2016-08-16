'use strict';
// Service requirements
const users_routes = require('./routes/users');
const users_models = require('./models/users');
const admins_routes = require('./routes/admins');
const check_hostname = require('./middlewares/check_hostname');

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
.header('X-Session-Id', joi.string())
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
    res.throw('bad request', 'Username already taken', creation.details);
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
.header('X-Session-Id', joi.string())
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
.header('X-Session-Id', joi.string())
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
.header('X-Session-Id', joi.string())
.body(joi.object(users_models.update_password).required())
.description('Update the user password, user can update only himself.');

/* Admin */
// TODO:
//router.get('/admin/users', admins_routes.list);
//router.get('/admin/users/:username', admins_routes.get);
//router.post('/admin/users', admins_routes.create);
//router.put('/admin/users/:username', admins_routes.update);
//router.delete('/admin/users/:username', admins_routes.delete);
//router.post('/admin/admins/:username', admins_routes.create_admin);

// TODO: Password reset get token

// TODO: Password reset

// TODO: Password update
