A great open-source software to monitor your applications is
[Prometheus](https://prometheus.io) originally built at *SoundCloud*.
It has a multi-dimensional data model to keep track of time series with
key/value pairs and a flexible query language to make great use of it.

![Prometheus graph]({{ image: prometheus-graph.png }})

*Prometheus* uses an *HTTP-based pull model* for collecting metrics.
That means that the applications you want to monitor should normally expose
a `/metrics` *HTTP* endpoint that *Prometheus* can access.
It then periodically *scrapes* the configured targets to retrieve the latest
metrics from them.
If this is not your thing, you can also use a
[push model](https://prometheus.io/docs/instrumenting/pushing/) via *gateways*.

The server is available as a *Docker* image too as
[prom/prometheus](https://hub.docker.com/r/prom/prometheus/) so to try it out
you can simply start it like:

```shell
docker run -p 9090:9090 -v /tmp/prometheus.yml:/etc/prometheus/prometheus.yml \
       prom/prometheus
```

This expects the `prometheus.yml` configuration file at `/tmp/prometheus.yml`
on the host machine.
Configuration is done via this simple *YAML* file where you can define global settings
and the scrape targets:

```yaml
global:
  scrape_interval:     15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.

scrape_configs:
  # Prometheus to monitor itself
  - job_name: 'prometheus'

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'remote-app'

    static_configs:
      - targets: ['remote.server:9122']
```

The server conveniently responds to *SIGHUP* signals by reloading itsi
configuration which makes it an excellent candidate for integrating with
[Docker-PyGen](https://github.com/rycus86/docker-pygen).
It supports many other configuration options though for service discovery
so make sure to have a look at the
[configuration reference](https://prometheus.io/docs/operating/configuration/)
to see if any of them would work better for you.

To expose metrics, you can have a look at the growing list of existing
[exporters](https://prometheus.io/docs/instrumenting/exporters/) or you can
roll your own using the [client libraries](https://prometheus.io/docs/instrumenting/clientlibs/).
The response format is very simple but most of these libraries have convenience
functions to start an *HTTP* endpoint doing this for you.

*Prometheus* comes with a simple *UI* to check the configuration, the status
of the scrape targets and query and visualisation page.

![Prometheus scrape targets]({{ image: prometheus-targets.png }})

This gives you a quick and easy way to run queries ad-hoc but for visualization
you will probably want something more sophisticated.

