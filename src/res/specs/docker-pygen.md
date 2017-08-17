I found *docker-gen* amazing and it *mostly* did what I wanted but I'm not
familiar with Go or its templates so it would have been difficult to get it
to do *exactly* what I wanted.

For this reason I started working on [Docker-PyGen](https://github.com/rycus86/docker-pygen).
It is the same concept but implemented in *Python* and it uses
[Jinja2 templates](http://jinja.pocoo.org/docs) to generate content for configuration files -
the same language that *Flask* uses for rendering content and is behind this page and site too.

Having this tool in Python allows me to write more expressive templates with the models
over the runtime information of *Docker containers*.
For example:

```
http://{{ container.networks.first_value.ip_address }}:{{ container.ports.tcp.first_value }}/
          ^^        ^^       ^^          ^^
          model     list     property    str
          (dict)             (dict)

- or -

https://{{ containers.labels.virtual_host }}:{{ container.env.http_port }}/{{ container.labels.context_path }}
                      ^^     ^^                           ^^       ^^
                      (dict) key                          (dict)   key
                             labels['virtual_host']                env['HTTP_PORT']
```

Because the [docker-py](https://github.com/docker/docker-py) models from the official
*Python* client are wrapped, I could add these methods for convenience when using
it in templates.
You can also use `matching` on lists of *containers* or networks to filter
them to loop through *container* having been attached to the same network
in a *Compose project* for example.

Like *docker-gen*, this tool can also *signal* or restart other containers
when the target configuration file is updated.
I wanted to remove the need having to run the target container as a single
instance with a pre-defined name so *Docker-PyGen* supports targeting
*containers* by *Compose service name* or specific labels / environment
variables too.
