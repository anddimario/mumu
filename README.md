# mumu - Multisite multicontent REST API

Users and sites management REST API with common method (manage sites, users and passwords)

### Requirements and installation

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

# License

Copyright (c) 2016 Andrea Di Mario

License: MIT
