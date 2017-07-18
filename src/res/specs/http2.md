Once we have *SSL* enabled on our endpoints, there's really nothing stopping us
from enabling *HTTP/2* as well.
The newer version of the protocol uses a *duplex* connection to the server
which allows multiple simultaneous requests and responses to be processed
on the same domain.

This is great for serving many *small* static files like *JavaScript* and *CSS*
but also if the *frontend* needs to issue *tons of AJAX calls* to *backend*
services that are all on the some domain - like this site.  

As it turns out, enabling *HTTP/2* on *nginx* is as easy as changing:

```
server {
  listen 443 ssl;
  ...
}
```

```
server {
  listen 443 ssl http2;
  ...
}
```

*Can you spot the difference?*

Having mentioned small static files (but also any kind of response - from *REST*
endpoints for example) it's generally a good idea to enable *gzip compression* on
all the responses where we can.
In my case it can be everything and on *nginx* you could do that in the main
configuration file (at `TODO/etc/nginx/nginx.conf` by default) like this:

```
http {
  ...
  gzip on;
  ..
}
```

Let's verify that everything is working as expected:

```shell
$ curl -s -v https://demo.viktoradam.net/page/specs > /dev/null
...TODO... response
```

*TODO explain headers*
