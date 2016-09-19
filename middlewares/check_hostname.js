/*
 * Check if hostname is enabled in sites
 */

'use strict';

module.exports = function (hostname) {
  const hostnames = module.context.configuration.sites.hostnames;
  if (hostnames.indexOf(hostname) !== -1) {
    return {type: "success"};
  } else {
    return {type: "error"};
  }
};
