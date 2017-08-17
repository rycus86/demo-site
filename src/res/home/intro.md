This website exists to showcase an example of creating
a set of applications built, tested and deployed completely 
with open-source and free tools.

Most of the backend services are *Python* [Flask](http://flask.pocoo.org) applications
using [Jinja2](http://jinja.pocoo.org) templates
and [markdown](http://pythonhosted.org/Markdown/) 
while the frontend uses the [Material Design Lite](https://getmdl.io/index.html) library 
with [jQuery](https://jquery.com).

All backend services are built into [Docker](https://www.docker.com) images
on [Travis CI](https://travis-ci.org)
from source code on [GitHub](https://github.com).
The images are then pulled from [Docker Hub](https://hub.docker.com)
onto a [Pine64](https://www.pine64.org/?page_id=1194) server
where they are running behind an [Nginx](https://nginx.org/en/) proxy server
exposing secure HTTP/2 endpoints with SSL certificates
from [Let's Encrypt](https://letsencrypt.org).

Monitoring is done via
**Google Analytics**: [https://www.google.com/analytics](https://www.google.com/analytics/)
on the frontend and with [Prometheus](https://prometheus.io) and
[Grafana](https://grafana.com) on the backend.

The whole process including the deployments is automated,
the only manual step being the `git push` command.

To see how it works go to the *Specs* tab or click the button below.
