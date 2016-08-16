'use strict';

module.exports = function (hostname) {
  const sites = module.context.configuration.sites;
  if (sites.hostnames.indexOf(hostname) !== -1) {
    return {type: "success"};
  } else {
    return {type: "error"};
  }
};
