/*
 * Check if the user has the permissions to access the content
 */

'use strict';
const admins = module.context.collection('admins');
const users = module.context.collection('users');
const contents = module.context.collection('contents');

module.exports = function (username, hostname, id) {
  // Get user, try on user or on admin if it's not found in user
  const user = users.firstExample({
    username: username,
    hostname: hostname
  });
  if (!user) {
    const admin = admins.firstExample({
      username: username
    });
    if (admin) {
      // Check if a role is an admin and if the hostname is accessible
      if ((admin.role === "admin") && (admin.hostname !== hostname)) {
        return {type: "error"};
      } else {
        return {type: "success"};
      }
    } else {
      return {type: "error"};
    }
  } else {
    // Get the content owner
    const content = contents.firstExample({_id: id});
    if (content.owner === username) {
      return {type: "success"};
    } else {
      return {type: "error"};
    }
  }
};
