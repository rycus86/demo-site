Instead of relying on your *Bash history* and worrying about whether you'll
completely forget how do you usually run *container #97* how nice would it be
to define how to run a number of them with individual settings and have them
join virtual networks they need to be in?

[docker-compose](https://docs.docker.com/compose) does that for you and more.
All it needs is a simple *YAML* file to describe your application stack.

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
    read_only: true
    expose:
      - "5000"
    restart: always
    environment:
      - HTTP_HOST=0.0.0.0
  
  github-proxy:
    image: rycus86/github-proxy:aarch64
    read_only: true
    expose:
      - "5000"
    restart: always
    environment:
      - HTTP_HOST=0.0.0.0
    env_file:
      - github-secrets.env

  dockerhub-proxy:
    image: rycus86/dockerhub-proxy:aarch64
    read_only: true
    expose:
      - "5000"
    restart: always
    environment:
      - HTTP_HOST=0.0.0.0
    env_file:
      - dockerhub-secrets.env
```

The *Composefile* defines three *read-only* applications that will work together.
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
