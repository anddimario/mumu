'use strict';
const contents = module.context.collection('contents');
const users = module.context.collection('users');
const aql = require('@arangodb').aql;
const db = require('@arangodb').db;
const content_access = require('../middlewares/content_access');

module.exports = {
  create (user, informations, hostname) {
    try {
      if (informations.read) {
        informations.read = informations.read.split(",");
      }
      if (informations.write) {
        informations.write = informations.write.split(",");
      }
      informations.created_at = new Date().getTime();
      informations.owner = user;
      informations.hostname = hostname;
      contents.save(informations);
      return {type: "success"};
    } catch (e) {
      return {type: "error", details: e};
    }
  },
  get (slug, hostname) {
    try {
      let query = {
        hostname: hostname,
        slug: slug
      };
      const content = contents.firstExample(query);
      return {type: "success", details: content};
    } catch (e) {
      return {type: "error", details: e};
    }
  },
  search (username, hostname, filters) {
    try {
      let query = "FOR c IN @@collection", params = {
        "@collection": contents._id
      };
      query += " FILTER c.hostname == @hostname";
      params.hostname = hostname;
      // Get request user's informations
      const user = users.firstExample({
        username: username,
        hostname: hostname
      });
      // if filters is null, show only readable content
      if (!filters) {   
        query += ' FILTER c.read IN @role || NOT c.read';
        params.role = user.role;
      } else {
        if (filters.owner) {
          query += ' FILTER c.owner == @owner';
          params.owner = username;
        } else if (filters.writeable) {
          query += ' FILTER c.write IN @role || NOT c.write';
          params.role = user.role;
        } else if (filters.start_date) {
          query += ' FILTER c.created_at >= @start_date';
          params.start_date = filters.start_date;
        } else if (filters.end_date) {
          query += ' FILTER c.created_at <= @end_date';
          params.end_date = filters.end_date;
        } else if (filters.type) {
          query += ' FILTER c.type == @type';
          params.type = filters.type;
        } else {
          return {type: "error", details: "Bad filters"};
        }
      }
      query += " RETURN c";
      const list = db._query(query, params).toArray();
      return {type: "success", details: list};
    } catch (e) {
      return {type: "error", details: e};
    }
  },
  update (username, hostname, id, body) {
    // Need to check the permissions
    const permissions = content_access(username, hostname, id);
    if (permissions.type === "success") {
      // If the user has permissions, update
      try {
        const new_informations = {};
        if (body.read) {
          new_informations.read = body.read.split(",");
        }
        if (body.write) {
          new_informations.write = body.write.split(",");
        }
        if (body.slug) {
          new_informations.slug = body.slug;
        }
        if (body.title) {
          new_informations.title = body.title;
        }
        if (body.content) {
          new_informations.content = body.content;
        }
        if (body.type) {
          new_informations.type = body.type;
        }      
        new_informations.updated_at = new Date().getTime();
        contents.update(id, new_informations);
        return {type: "success"};
      } catch (e) {
        return {type: "error", details: e};
      }
    } else {
      return {type: "error", details: "Bad request"};
    }
  },
  delete (username, hostname, id) {
    // Need to check the permissions
    const permissions = content_access(username, hostname, id);
    if (permissions.type === "success") {
      // If the user has permissions, delete
      contents.remove(id);
      return {type: "success"};
    } else {
      return {type: "error", details: "Bad request"};
    }
  }
};
