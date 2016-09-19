/*
 * Check the admin and superadmin roles
 */

'use strict';
const admins = module.context.collection('admins');

module.exports = function (username, hostname) {
  // Get user
  const user = admins.firstExample({
    username: username
  });
  // Check if a role is an admin and if the hostname is accessible
  if ((user.role === "admin") && (user.hostname !== hostname)) {
    return {type: "error"};
  } else {
    return {type: "success"};
  }
};
