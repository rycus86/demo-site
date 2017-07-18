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
configuration file (at `/etc/nginx/nginx.conf` by default) like this:

```
http {
  ...
  gzip on;
  ..
}
```

Let's verify that everything is working as expected:

```shell
$ curl --compressed -s -v https://demo.viktoradam.net/page/specs > /dev/null 
*   Trying 94.192.68.109...
* TCP_NODELAY set
* Connected to demo.viktoradam.net (94.192.68.109) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* Cipher selection: ALL:!EXPORT:!EXPORT40:!EXPORT56:!aNULL:!LOW:!RC4:@STRENGTH
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/certs/ca-certificates.crt
  CApath: /etc/ssl/certs
* TLSv1.2 (OUT), TLS header, Certificate Status (22):
} [5 bytes data]
* TLSv1.2 (OUT), TLS handshake, Client hello (1):
} [512 bytes data]
* TLSv1.2 (IN), TLS handshake, Server hello (2):
{ [100 bytes data]
* TLSv1.2 (IN), TLS handshake, Certificate (11):
{ [2480 bytes data]
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
{ [333 bytes data]
* TLSv1.2 (IN), TLS handshake, Server finished (14):
{ [4 bytes data]
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
} [70 bytes data]
* TLSv1.2 (OUT), TLS change cipher, Client hello (1):
} [1 bytes data]
* TLSv1.2 (OUT), TLS handshake, Finished (20):
} [16 bytes data]
* TLSv1.2 (IN), TLS change cipher, Client hello (1):
{ [1 bytes data]
* TLSv1.2 (IN), TLS handshake, Finished (20):
{ [16 bytes data]
* SSL connection using TLSv1.2 / ECDHE-RSA-AES256-GCM-SHA384
* ALPN, server accepted to use h2
* Server certificate:
*  subject: CN=demo.viktoradam.net
*  start date: Jul 16 23:15:00 2017 GMT
*  expire date: Oct 14 23:15:00 2017 GMT
*  subjectAltName: host "demo.viktoradam.net" matched cert's "demo.viktoradam.net"
*  issuer: C=US; O=Let's Encrypt; CN=Let's Encrypt Authority X3
*  SSL certificate verify ok.
* Using HTTP2, server supports multi-use
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
} [5 bytes data]
* Using Stream ID: 1 (easy handle 0x55baba733da0)
} [5 bytes data]
> GET /page/specs HTTP/1.1
> Host: demo.viktoradam.net
> User-Agent: curl/7.52.1
> Accept: */*
> Accept-Encoding: deflate, gzip
> 
{ [5 bytes data]
* Connection state changed (MAX_CONCURRENT_STREAMS updated)!
} [5 bytes data]
< HTTP/2 200 
< server: nginx
< date: Tue, 18 Jul 2017 21:33:31 GMT
< content-type: text/html; charset=utf-8
< vary: Accept-Encoding
< content-encoding: gzip
< 
{ [15 bytes data]
* Curl_http_done: called premature == 0
* Connection #0 to host demo.viktoradam.net left intact
```

Let's have a look at the *HTTP* response and *headers*.

The server's certificate was verified successfully: 

```
* Server certificate:
*  subject: CN=demo.viktoradam.net
*  start date: Jul 16 23:15:00 2017 GMT
*  expire date: Oct 14 23:15:00 2017 GMT
*  subjectAltName: host "demo.viktoradam.net" matched cert's "demo.viktoradam.net"
*  issuer: C=US; O=Let's Encrypt; CN=Let's Encrypt Authority X3
*  SSL certificate verify ok.
```

*HTTP/2* is working as expected:

```
* Using HTTP2, server supports multi-use
* Connection state changed (HTTP/2 confirmed)
```

And finally, the response type was *gzip* compressed:

```
< HTTP/2 200 
< server: nginx
< date: Tue, 18 Jul 2017 21:33:31 GMT
< content-type: text/html; charset=utf-8
< vary: Accept-Encoding
< content-encoding: gzip
```
