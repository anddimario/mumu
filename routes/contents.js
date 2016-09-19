'use strict';
const contents = module.context.collection('contents');

module.exports = {
  create (user, informations, hostname) {
    try {
      if (informations.read) {
        informations.read = informations.read.split(",");
      }
      if (informations.write) {
        informations.write = informations.write.split(",");
      }
      informations.date = new Date().getTime();
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
      const content = contents.firstExample({
        hostname: hostname,
        slug: slug
      });
      return {type: "success", details: content};
    } catch (e) {
      return {type: "error", details: e};
    }
  },
};
