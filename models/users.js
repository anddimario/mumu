'use strict';

const joi = require('joi');

// Shared validator expressions
var password = joi.string().regex(/^[a-zA-Z0-9]{3,30}$/);

module.exports = {
  create: {
    username: joi.string().required(),
    password: password,
    email: joi.string().email().required(),
    role: joi.string().required()
  },
  login: {
    username: joi.string().required(),
    password: password
  },
  update: {
    email: joi.string().email().required()
  },
  update_password: {
    old: password,
    new: password
  },
  password_token: {
    username: joi.string().required(),
  },
  password_reset: {
    token: joi.string().required(),
    new: password
  }

};
