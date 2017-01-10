# mumu - Multisite multicontent REST API

Users and sites management REST API with common method (manage sites, users and passwords)

### Requirements and installation
ArangoDB[https://www.arangodb.com/] ^3.0.4, after you've installed the service, edit the configuration variables, here an example for sites 
variable:
```
{ 
  "hostnames":["localhost","127.0.0.1"], 
  "roles": ["user"]
}
```

To Create an admin, run the script create-admin from web console with this payload:
```
{"username": "...", "email": "....", "password": "...", "role": "superadmin"}
```
Admins role: admin, is admin for the site, superadmin, is admin for all the sites.

### Example microservice plugin
Ecommerce: https://github.com/anddimario/mumu-ecommerce

# License

Copyright (c) 2017 Andrea Di Mario

License: MIT
