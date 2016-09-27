'use strict';

const createAuth = require('@arangodb/foxx/auth');
const auth = createAuth();
const users = module.context.collection('users');
const admins = module.context.collection('admins');
const aql = require('@arangodb').aql;
const db = require('@arangodb').db;

module.exports = {
  login (credentials, hostname) {
    // This may return a user object or null
    const user = admins.firstExample({
      username: credentials.username
    });
    //const user = db._query('FOR u IN admins FILTER u.role == "admin" || u.role == "superadmin" FILTER username == @@username RETURN u', {'@@coll': users, '@@username': credentials.username});
    const valid = auth.verify(
      // Pretend to validate even if no user was found
      user ? user.authData : {},
      credentials.password
    );
    if (!valid) {
      return {type: "error", details: 'unauthorized'};
    } else {
      // Check if a role is an admin and if the hostname is accessible
      if ((user.role === "admin") && (user.hostname !== hostname)) {
        return {type: "error", details: 'unauthorized'};
      } else {
        return {type: "success", details: user};
      }
    }
  },
  list (hostname) {
    try {
      const list = db._query(aql`
        FOR u IN ${users} 
          FILTER u.hostname == ${hostname} 
          RETURN {username: u.username, role: u.role, email: u.email}
      `).toArray();
      return {type: "success", details: list};
    } catch (e) {
      return {type: "error", details: e};
    }
  }
};
