When I was looking for a solution to route requests to my apps I came across the 
brilliant [jwilder/nginx-proxy](https://github.com/jwilder/nginx-proxy) project on *GitHub*.
It is a self-contained *Docker image* that will run an *Nginx proxy server* plus
a lightweight process (called *docker-gen*) that listens for *container* start and stop events 
from the *Docker daemon* and automatically reconfigures *Nginx* - __*plain awesome!*__

It requires attaching the *Docker socket file* as a *volume* to the container so it
can connect to the *daemon*.
It also requires the target *containers* to *expose* their target ports and to have
the `VIRTUAL_HOST` environment variable set to the domain name we want *Nginx* to
proxy the requests from.
As *containers* start or stop (or *scale*) *Nginx* is automatically reloaded with 
the updated auto-generated configuration, load-balancing between multiple instances of
the same application if it runs as multiple *containers* by *scaling*.

This is great because the only thing you have to worry about is starting properly
configured *containers* and *docker-gen* will do the rest for you.
If you want to add a new application to your stack you just start it with the 
`VIRTUAL_HOST` environment variable set to the new domain name and you're done.

Having a publicly available endpoint that also has *root* access to your *Docker daemon*
is not the most secure thing ever though but the *GitHub* project suggest a nice alternative.
You can run *Nginx* as the only *container* with an externally reachable port alongside an
individual [docker-gen container](https://github.com/jwilder/docker-gen) that has read-only access 
to the *daemon* and a shared *volume* with *Nginx* to be able to update its configuration file.
When it did that it will send a *UNIX signal* to the *nginx container* that causes the 
proxy server to reload its configuration.

Let's look at the *Composefile* for this site again:
```yaml
version: '2'
services:

  # Proxy server
  nginx:
    image: rycus86/arm-nginx:aarch64
    container_name: nginx
    ports:
      - "80:80"
    volumes:
      - nginx-config:/etc/nginx/conf.d

  nginx-gen:
    image: rycus86/arm-docker-gen:aarch64
    container_name: nginx-gen
    command: -notify-sighup nginx -watch -only-exposed /etc/docker-gen/templates/nginx.tmpl /etc/nginx/conf.d/default.conf
    volumes:
      - nginx-config:/etc/nginx/conf.d
      - /tmp/nginx-proxy.tmpl:/etc/docker-gen/templates/nginx.tmpl:ro
      - /var/run/docker.sock:/tmp/docker.sock:ro

  # Demo site
  demo-site:
    image: rycus86/demo-site:aarch64
    expose:
      - "5000"
    environment:
      - VIRTUAL_HOST=demo.viktoradam.net

  # REST services
  github-proxy:
    image: rycus86/github-proxy:aarch64
    expose:
      - "5000"
    environment:
      - VIRTUAL_HOST=github.api.viktoradam.net

  dockerhub-proxy:
    image: rycus86/dockerhub-proxy:aarch64
    expose:
      - "5000"
    environment:
      - VIRTUAL_HOST=docker.api.viktoradam.net

volumes:
  nginx-config:
```

To piece it together:

- `nginx` listens on port *80* from the outside world and passes connections to port *80*
  of the running *Nginx* process.
- `nginx-gen` is configured to share the configuration *volume* with it and with the name
  of the *container* to send the reload *signal* to.
  It also has read-only access to the *Docker daemon* but not any other *containers*.
- The *Flask* applications don't have *externally bound* ports, they only *expose* their
  port *5000* so *Nginx* can proxy requests to them on the *Docker* virtual network.  
  They also each have their corresponding `VIRTUAL_HOST` variable set.
- The `volumes` section declares the *volume* shared by both `nginx` and `nginx-gen`.

Again, adding a new application to this stack is a matter of adding its configuration to
the *Composefile* and executing a `docker-compose up -d` command.

What if you want more flexibility on how the configuration file is templated *and/or*
you're not a huge fan of Go templates?
Enter *Docker-PyGen*.
