To make the website and the API endpoints more secure, we should really expose them
on *HTTPS* rather than *HTTP*.
Thankfully this can now be done __*for free*__ too!

The [LetsEncrypt organization](https://letsencrypt.org) is dedicated to make the
web safer and more secure so they provide services that allow the registration of
*SSL certificates* for free and in an automated fashion.
To get started, you only need an [ACME protocol](#TODO link) compliant client (like
the official [Certbot client](#TODO link)) and to control the domain you want to register.
If all works out, you'll get an SSL certificate that is trusted by most modern
browsers and *HTTPS client* libraries.

To register (or renew) a certificate for a domain, *LetsEncrypt* needs to verify
that you actually own it.
At the moment, this is done by getting their services to issue requests to the
target domain where *some application* needs to respond to their challenge.

If you don't have anything running on the target yet, the easiest way is to let
*certbot* start a simple *Python webserver* to respond to these challenges on
the standard *HTTP* or *HTTPS* ports.  
This can be done easily like this:

```shell
#TODO add example
```

You might already have a webserver in place though so this method of verification
would not work.
On this demo site I have *nginx* listening on both of those ports and I can easily
get it to accept the challenges.
All it takes is to define a *root* folder for static content on the target domain
and save the challenge response in a file in there before the request arrives.
You can achieve this manually with a couple of *Shell commands* but why not automate it?

Using my *docker-py* tool and a *container* having *certbot* with a couple of scripts
I can generate a list of *Shell commands* to instruct *certbot* to request or renew
certificates for domains defined as *labels* on the running *containers*.  
The template for this is really quite simple:

```
#TODO add template
```

Once the list of commands is generated, I can send a signal to the *container* that
has *certbot* to take them one-by-one and execute them.
In the template, the `TODO--auth-hook` parameter refers to a *Shell script* that will
save the challenge file with the appropriate content on a *shared volume* that maps
onto the static file folder on *nginx*.
This is run before the actual challenge starts and can be cleaned up using the
`TODO--auth-cleanup` parameter once it's finished.

*certbot* saves the certificates in the `/etc/letsencrypt/TODO-path/live/<domain>`
folder by default so we just need to make sure this also resides on a *shared volume*
to make it accessible for *nginx*.

### Putting it all together

The relevant parts of the *docker-compose.yml* look like this:

```yaml
TODO:
  compose sample
```

The changes in the *nginx* *docker-py* template are:

```
TODO nginx.template
```

The template for `certbot-helper` is as shown earlier.
Once the target file with the list of *certbot* commands is updated, the *SIGHUP* signal
will execute those commands and we'll have our fresh *SSL certificates* in place - *yay!*

