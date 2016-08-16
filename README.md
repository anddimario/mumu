# mumu - Multisite multicontent REST API

Users and sites management REST API with common method (manage sites, users and passwords)

### Requirements and installation

Install arangodb (^3.0.4), then import this as service. Need to setup the configuration variables, sites is an object with a list of available domains, like:
```
{"hostnames":["localhost","127.0.0.1"]}
```
A first admin was created with username: admin and password: admin.

# License

Copyright (c) 2016 Andrea Di Mario

License: MIT
