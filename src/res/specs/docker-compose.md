Instead of relying on your *Bash history* and worrying about whether you'll
completely forget how do you usually run *container #97* how nice would it be
to define how to run a number of them with individual settings and have them
join virtual networks they need to be in?

[docker-compose](https://docs.docker.com/compose) does that for you and more.
It allows you to define your *Docker* stack in a *YAML* file with all their settings.
```yaml
version: '2'
services:
  ws:
    image: my/fancy-web-server
    ports:
      - "8080:8011"
      - "5000"
    environment:
      - SECRET=notsosecret

  backend:
    image: my/be-app
    expose:
      - "4001"

  database:
    image: my/uber-sql
    expose:
      - "3306"
    environment:
      - USER=root
      - PASS=xyz123
```

This *Composefile* defines three *containers*:

- `ws` will run having the `SECRET` environment variable set to the `xyz123` value
  and it will listen on ports *5000* and *8011* plus the host *OS* will forward
  traffic from its port *8080* to the *container's 8011*
- `backend` uses a different *image* and exposes it's port *4001* 
  (this is local to the *container*)
- `database` uses a third image and will run with the `USER` and `PASS`
  environment variables set

To see what *docker-compose* can do check the 
[Composefile reference](https://docs.docker.com/compose/compose-file) - it is quite powerful.
It even allows you to *scale* your *containers* and have them running multiple
times if you want it.

Let's have a look at this site's *Composefile* for another example:
```yaml
version: '2'
services:

  demo-site:
    image: rycus86/demo-site:aarch64
    expose:
      - "5000"
    restart: always
    environment:
      - HTTP_HOST=0.0.0.0
  
  github-proxy:
    image: rycus86/github-proxy:aarch64
    expose:
      - "5000"
    restart: always
    environment:
      - HTTP_HOST=0.0.0.0
    env_file:
      - github-secrets.env

  dockerhub-proxy:
    image: rycus86/dockerhub-proxy:aarch64
    expose:
      - "5000"
    restart: always
    environment:
      - HTTP_HOST=0.0.0.0

  googleplay-proxy:
    image: rycus86/googleplay-proxy:aarch64
    expose:
      - "5000"
    restart: always
    environment:
      - HTTP_HOST=0.0.0.0
    env_file:
      - gplay-secrets.env
```

Each application exposes its port *5000* to listen for incoming requests and
they are also configured in a way that *Docker* would restart them automatically
should they fail for whatever reason.
The `HTTP_HOST` environment variable is set to `0.0.0.0` and is processed by 
the *Flask* app by making it listen on all network interfaces - not only on
*localhost* like it would do by default.
Unlike [Docker Swarm](https://docs.docker.com/engine/swarm) *docker-compose* cannot
manage *secrets* so those are passed to the containers as environment variables from
a *key-value* text file.
Note that the *containers* are all based on `aarch64` *images* built automatically
by *Travis* and are uploaded to *Docker Hub*. 

Given that each of the apps listen on port *5000* we need a way of getting
requests to find the correct target when sent from the external network.
