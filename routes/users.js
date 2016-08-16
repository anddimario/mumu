'use strict';

const createAuth = require('@arangodb/foxx/auth');
const crypto = require('@arangodb/crypto');
const auth = createAuth();
const users = module.context.collection('users');

module.exports = {
  login (credentials, hostname) {
    // This may return a user object or null
    const user = users.firstExample({
      hostname: hostname,
      username: credentials.username
    });
    const valid = auth.verify(
      // Pretend to validate even if no user was found
      user ? user.authData : {},
      credentials.password
    );
    if (!valid) {
      return {type: "error", details: 'unauthorized'};
    } else {
      return {type: "success", details: user};
    }
  },
  get (username, hostname) {
    try {
      const user = users.firstExample({
        hostname: hostname,
        username: username
      });
      // Delete informations not needed
      delete user.authData;
      return {type: "success", details: user};
    } catch (e) {
      return {type: "error", details: e};
    }
  },
  create (user, hostname) {
    try {
      // Create an authentication hash
      user.authData = auth.create(user.password);
      user.hostname = hostname;
      user.role = "user";
      delete user.password;
      const meta = users.save(user);
      Object.assign(user, meta);
      return {type: "success", details: user};
    } catch (e) {
      // We'll assume the UniqueConstraint has been violated
      return {type: "error", details: e};
    }
  },
  update (username, value, hostname) {
    try {
      users.updateByExample({
        hostname: hostname,
        username: username
      }, value);
      return {type: "success"};
    } catch (e) {
      // We'll assume the UniqueConstraint has been violated
      return {type: "error", details: e};
    }
  },
  delete (username, hostname) {
    try {
      const user = users.removeByExample({
        hostname: hostname,
        username: username
      });
      return {type: "success"};
    } catch (e) {
      return {type: "error", details: e};
    }
  },
  update_password (username, value, hostname) {
    // Check if it's a valid password, try login
    const user = users.firstExample({
      hostname: hostname,
      username: username
    });
    const valid = auth.verify(
      // Pretend to validate even if no user was found
      user ? user.authData : {},
      value.old
    );
    if (!valid) {
      return {type: "error", details: 'unauthorized'};
    } else {
      try {
        // Create an authentication hash
        let authData = auth.create(value.new);
        users.updateByExample({
          hostname: hostname,
          username: username
        }, {authData: authData});
        return {type: "success"};
      } catch (e) {
        // We'll assume the UniqueConstraint has been violated
        return {type: "error", details: e};
      }
    }
  },
  password_token (username, hostname) {
    try {
      // Calculate the token
      let token = crypto.genRandomAlphaNumbers(32);
      // Try to update the user
      users.updateByExample({
        hostname: hostname,
        username: username
      }, {
        reset_password_token : token,
        reset_password_timestamp: new Date().getTime()
      });
      return {type: "success"};
    } catch (e) {
      // We'll assume the UniqueConstraint has been violated
      return {type: "error", details: e};
    }
  },
  password_reset (value, hostname) {
    try {
      let now = new Date().getTime();
      let limit = now - 60*60*24*2*1000;
      const user = users.firstExample({
        hostname: hostname,
        reset_password_token: value.token
      });
      // Check if token is expired
      if (user.reset_password_timestamp > limit) {
        // Update with new password
        let authData = auth.create(value.new);
        users.updateByExample({
          hostname: hostname,
          username: user.username
        }, {
          authData: authData,
          reset_password_token: null,
          reset_password_timestamp: null
        });
        return {type: "success"};
      } else {
        return {type: "error", details: "Token expired"};
      }
    } catch (e) {
      return {type: "error", details: e};
    }
  },
};
