'use strict';

const joi = require('joi');

module.exports = {
  create: {
    slug: joi.string().required(),
    title: joi.string(),
    content: joi.string().required(),
    type: joi.string().required(),
    read: joi.string(),
    write: joi.string()
  },
  update: {
    slug: joi.string(),
    title: joi.string(),
    content: joi.string(),
    type: joi.string(),
    read: joi.string(),
    write: joi.string()
  }
  
}
