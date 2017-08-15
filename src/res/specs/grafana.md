[Grafana](https://grafana.com/) is also an open platform for analytics and monitoring.
It supports over 25 data sources already to build beautiful dashboards using their data.

[](#todo: insert image of a dashboard)

*Grafana* is also available as a *Docker* image.
You can get it by pulling the official
[grafana/grafana](https://hub.docker.com/r/grafana/grafana/) image
then running it as:

```shell
docker run -d --name=grafana -p 3000:3000 grafana/grafana
```

This will start the server on port *3000* and you can log in using the
`admin/admin` credentials.

The platform supports *Prometheus* out of the box so you can add it easily.

[](#todo: insert add data source image)

Once it's done, you can build a dashboard using its metrics or you can
also import the default dashboard for it that displays useful metrics about
the *Prometheus* server itself.

[](#todo: insert image for Prometheus dashboard)

To make these monitoring systems connected in my *docker-compose* project
I a setup like this:

```yaml
version: '2'
services:

  ...services to monitor...

  prometheus:
    image: rycus86/prometheus:aarch64
    ...
  
  prometheus-pygen:
    image: rycus86/docker-pygen:aarch64
    ...
  
  grafana:
    image: rycus86/grafana:aarch64
    ...

volumes:
  prometheus-config:
```

This way I can get the [docker-pygen](https://github.com/rycus86/docker-pygen)
container to reload the *Prometheus* configuration when new services are
available and have *Grafana* point to it as `http://prometheus:9090`.
*Simple, isn't it?*

