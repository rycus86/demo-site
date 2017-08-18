To help you monitor your *Docker* containers better you can also run
[Portainer](https://portainer.io).
The application is a lightweight management UI that taps into the
*Docker* daemon to provide all sorts of useful information about it.

Getting started could not be easier:

```shell
docker run -d --name portainer -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock \
       portainer/portainer
```

This starts *Portainer* on port *9000* so just launch `http://localhost:9000/`
in your browser.
On first run, it will ask you for an *admin* password then you can access
the interface afterwards.

The dashboard gives you a quick glance over some metrics around the number
of containers, images, volumes and *Docker* networks you have plus basic
information about the node it is connected to and about
[Swarm](https://docs.docker.com/engine/swarm/) if it is available.

![Portainer dashboard]({{ image: portainer-dashboard.png }})

You can see details of all of them on dedicated pages and you can even control
them from there - *pretty nice*.

![Portainer containers]({{ image: portainer-containers.png }})

You can pull new images or start new containers and services for example from
these pages.
It is also great for quickly checking what is unused and deleting them - in case
you have not grown to love the new `prune` commands on the *Docker CLI* yet.

If you want to use this in *Docker Compose* you could have it defined like this:

```yaml
version: '2'
services:

  ...other services...

  portainer:
    image: portainer/portainer:linux-arm64
    restart: always
    ports:
      - "9000:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

As you can see, the official images are available for multiple architectures,
not only for *x64* which is very nice.

