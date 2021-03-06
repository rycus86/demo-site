[Grafana](https://grafana.com) is also an open platform for analytics and monitoring.
It supports over 25 data sources already to build beautiful dashboards using their data.

![Grafana node metrics]({{ image: grafana-node.png }})

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

![Grafana datasource]({{ image: grafana-datasource.png }})

Once it's done, you can build a dashboard using its metrics or you can
also import the default dashboard for it that displays useful metrics about
the *Prometheus* server itself.

![Grafana - Prometheus]({{ image: grafana-prometheus.png }})

To make these monitoring systems connected in my *docker-compose* project
I a setup like this:

```yaml
version: '2'
services:

  ...services to monitor...

  # Metrics
  prometheus:
    image: rycus86/prometheus:aarch64
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - prometheus-config:/etc/prometheus:ro
  
  prometheus-pygen:
    image: rycus86/docker-pygen:aarch64
    command: --template /etc/docker-pygen/templates/prometheus.tmpl --target /etc/prometheus/prometheus.yml --signal prometheus HUP
    restart: always
    volumes:
      - prometheus-config:/etc/prometheus
      - /tmp/prometheus-pygen.tmpl:/etc/docker-pygen/templates/prometheus.tmpl:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro

  prometheus-node-exporter:
    image: rycus86/prometheus-node-exporter:aarch64
    command: --collector.procfs /host/proc --collector.sysfs /host/sys
    restart: always
    expose:
      - "9100"
    labels:
      - prometheus-job=node-exporter
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
  
  grafana:
    image: rycus86/grafana:aarch64
    restart: always
    ports:
      - "3000:3000"
    labels:
      - nginx-virtual-host=metrics.viktoradam.net
    volumes:
      - /tmp/grafana.config.ini:/etc/grafana/grafana.ini

volumes:
  prometheus-config:
```

This way I can get the [Docker-PyGen](https://github.com/rycus86/docker-pygen)
container to reload the *Prometheus* configuration when new services are
available and have *Grafana* point to it as `http://prometheus:9090`.
*Simple, isn't it?*

You can see *live* dashboards at [metrics.viktoradam.net](https://metrics.viktoradam.net):

- [Machine metrics](https://metrics.viktoradam.net/dashboard/db/machine-metrics)
- [Prometheus metrics](https://metrics.viktoradam.net/dashboard/db/prometheus-stats)

