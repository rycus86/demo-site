By *continuous deployment* I mean that after a `git push` you don't have to do
anything manual to get a successful build onto the target server - 
it should happen __*automatically*__.  
Apart from hosting an actual server this can be done for free as well, let's see how.

## Docker

[Docker](https://www.docker.com) is *(broadly speaking)* an automation tool that was created to 
build reusable *images* and start lightweight *containers* of them.
Since the start *Docker* is now able to do much more than that including but not limited to 
virtual network management and multi-host orchestration with load-balancing and 
automatic fail-over.  
Make sure you're familiar with *Docker* for this part by 
[reading their documentation](https://docs.docker.com/get-started).

The idea behind it is that if you can build a *Docker* *image* that you can run on one machine
that same image should work on *any* machine having *Docker*.  
That sounds nice, right?

To make builds repeatable *Docker* uses *Dockerfiles* - simple text files with a set of 
pre-defined instructions to create and *image*.

Let's look at an example:
```dockerfile
FROM alpine

RUN apk add --no-cache python py2-pip ca-certificates

ADD requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

ADD src /app
WORKDIR /app

CMD [ "python", "app.py" ]
```

The *container* running this site starts `FROM` a *base image* called `alpine`,
the super-small [Alpine Linux](https://alpinelinux.org) distribution that is 
ideal for building (and transferring) *images* based on them.  
The `RUN` instruction executes *Shell* commands like you would do if you would do this
on an actual server the old-fashioned way.  
`ADD` (or `COPY`) copies files or directories from your host machine into the 
result *image* to make it available when running it as a *container*.  
Finally, `CMD` defines what command should be executed when starting a *container* from
this *image* unless an override is specified on the `docker run` command.

To see a complete reference for [Dockerfile instructions](https://docs.docker.com/engine/reference/builder) check this link.
While you're there, make sure to have a look at 
[best practises](https://docs.docker.com/engine/userguide/eng-image/dockerfile_best-practices) for writing *Dockerfiles*.

To create an *image* from a *Dockerfile* you can execute 
`docker build -t <owner>/<image-name>:<tag> -f Dockerfile .`  
The `-f` bit can be left out if you're using the default filename.
The `-t` parameter assigns basically a name to the result image that you can refer to
when interacting with it - to run a *container* or update it to a newer version for example.  
Each instruction in the *Dockerfile* will add a new *layer* on top of the ones already in there
and the `docker build` command can reuse previously processed *layers* where the instruction
didn't change in the *Dockerfile*.
This basically caches steps that were successful so you won't have to wait to install *79*
packages with *apt-get* for example every time you build it locally.

Once your *image* is ready you'll probably want to distribute it (or at least copy it
to another host for actually running *containers* of it).  
*Docker* uses *registries* to allow you to do that which efficiently store *images*
and lets you *push* new or *pull* existing content from it.
It also handles layers and their caching as expected so on updates there's a good chance
some layers can be reused without having to download them again.

## Docker Hub

[Docker Hub](https://hub.docker.com) is the official hosted *Docker registry*.
It is free to sign-up and start pushing *public* images into it so basically *Docker*
is giving you space to store them for free - awesome!

The *Docker client* is able to interface with *Docker Hub* quite easily:
```shell
$ docker login
$ docker push my-user/my-awesome-image:latest
...
$ docker pull my-user/my-awesome-image
```

The `docker login` command will authenticate you against *Docker Hub* so you can `push` your
images to the cloud later.
Once there, the `pull` command fetches the latest version of the image which works without
authentication too for public images.

If that is too *1998* for you then you can also use a nice feature of *Docker Hub*
called *automated builds*.
It can connect to your *GitHub* or *BitBucket* account and build your *Docker* project
automatically on new changes on *Docker*'s infrastructure.
You can easily do the same with *Travis* but the nice thing here is that your images
built this way will be marked as *automated build* on *Docker Hub* also displaying the
*Dockerfile* they were built from so others can be sure that when they `pull` it the
*image* will actually contain and do what you say it would.

Multiple versions (e.g. *tags*) are also supported.
If you have different branches in *GitHub* then *Docker Hub* by default will take
branch name and use it as *Docker tag* to build the *Dockerfile* in that branch.
See the [rycus86/pycharm](https://hub.docker.com/r/rycus86/pycharm/tags) image 
for example and the [related repository](https://github.com/rycus86/docker-pycharm).

If you're not sick of badges by this point then good news, here are two more from
[Shields.io](https://shields.io):  
[![Build Status](https://img.shields.io/docker/build/rycus86/demo-site.svg)](https://hub.docker.com/r/rycus86/demo-site)
[![Pulls](https://img.shields.io/docker/pulls/rycus86/demo-site.svg)](https://hub.docker.com/r/rycus86/demo-site)

## Multiarch builds

This is all nice and good and it works well as long as you want to build *images*
for the most common `x86` (or `x64`) architecture - 
*Docker Hub* should have no problems with that.  
But what if you want the same app available for `armv7` or `aarch64` as well?
*- I'll explain a bit later why you would want to do that.*

This is where we turn back to our awesome *Travis matrix builds*.

Previously we used the *Python* unit tests as a build success indicator but
arguably your build being successful should mean that you can also produce a
deployable *binary version* of it too.
Even having *automated builds* on *Docker Hub* shouldn't stop us from running 
*Docker* builds on *Travis* too if we want to.

To [enable Docker builds on Travis](https://docs.travis-ci.com/user/docker) the
`.travis.yml` file has to say:
```yaml
sudo: required
services:
  - docker
```

After this we can use any *Docker* commands we want in the build.  
For testing the build we'll want to run a `docker build` command.

Going back to *multiarch*: if we can get *Travis* to build a *Docker image* for us
then we can get it to build *N* images for *N* different *Dockerfiles* in the same project.  
The project running this site for example has three of them:

- __Dockerfile__: for `x86` hosts
- __Dockerfile.armhf__: for *32-bits ARM* hosts like the *Raspberry Pi*
- __Dockerfile.aarch64__: for *64-bits ARM* hosts like the *Pine64*

They are all exactly the same except for the initial `FROM` instruction
that select an *alpine base image* each appropriate for the target architecture.

We could use a single build to create the *images* one-by-one sequentially but
we can do better.
Take this build configuration for example:
```yaml
language: python
python:
  - '2.7'
sudo:
  - required
services:
  - docker
script:
  # python tests
  - PYTHONPATH=src python -m coverage run --branch --source=src -m unittest discover -s tests -v
  # docker build
  - docker run --rm --privileged multiarch/qemu-user-static:register --reset
  - docker build -t demo-site:$DOCKER_TAG -f $DOCKERFILE .
after_success:
  # push docker image
  - >
    if [ "$DOCKER_PUSH" == "yes" ] && [ "$TRAVIS_BRANCH" == "master" ]; then
      docker login -u="rycus86" -p="$DOCKER_PASSWORD"
      docker tag demo-site:$DOCKER_TAG rycus86/demo-site:$DOCKER_TAG
      docker push rycus86/demo-site:$DOCKER_TAG
    else
      echo 'Not pushing to Docker Hub'
    fi
env:
  matrix:
  - DOCKER_TAG=latest  DOCKERFILE=Dockerfile
  - DOCKER_TAG=armhf   DOCKERFILE=Dockerfile.armhf   DOCKER_PUSH=yes
  - DOCKER_TAG=aarch64 DOCKERFILE=Dockerfile.aarch64 DOCKER_PUSH=yes
```

What happens here is:

- The `script` section now contains a `docker build` instruction 
  (if it fails the build will fail too)
- In `after_success` we log in with our *Docker Hub* credentials
  (which is nicely hidden by *Travis*) then we *tag* the *image* to be 
  pushed under our *Docker Hub* user and finally `push` it - if we want to
  and we just built from the *master* branch
- The `env` / `matrix` section injects the actual values for the environment
  variables for each sub-build.

I have to add a couple of footnotes at this point.

Pushing the built *image* can be disabled by not setting the `DOCKER_PUSH` 
environment variable to `yes`.
You probably want to do this for the version that gets built by *Docker Hub*
automatically to avoid overwriting that version.

Having said that, even for *automated builds* it seems that *Docker Hub* will
allow you to push *images* with different *tags* under the same space without 
any problems - in fact this is how I have my *ARM* builds together with the
automated one.

Finally, I have not explained this line so far:  
`docker run --rm --privileged multiarch/qemu-user-static:register --reset`  
This is what makes the *multiarch* builds possible.
The [multiarch/qemu-user-static](https://github.com/multiarch/qemu-user-static)
project makes it possible to register a *static QEMU* binary with the host kernel
so when it receives instructions for another processor architecture it will use
that to execute the commands.
For example on the `x86` *Travis* hosts we can run executables compiled for *ARM* 
architecture after this line.

For the *ARM* *Docker* builds to pass we also need to make sure that the instructions
(e.g. commands) run by the build will have access to the *static QEMU* binary.
To do so we need to use *base images* that have it at `/usr/bin/qemu-arm-static` and 
that file is executable.  
It turns out this is very simple to do and we can even do it with a *Docker Hub*
*automated build*, see these projects for example:

- [rycus86/armhf-alpine-qemu](https://github.com/rycus86/docker-armhf-alpine-qemu/blob/master/Dockerfile) -
  an *alpine*-based image for *32-bits ARM* hosts
- [rycus86/arm64v8-alpine-qemu](https://github.com/rycus86/docker-arm64v8-alpine-qemu) -
  an *alpine*-based image for *64-bits ARM* hosts

To give credit, this is based on the great work the 
[Hypriot team documented](https://blog.hypriot.com/post/setup-simple-ci-pipeline-for-arm-images)
even though it looks like people have [come up with this](https://github.com/travis-ci/travis-ci/issues/3376) back in late 2015.

OK, great, this is working nicely again but the question still stands:
__*"why would we even want to do this to ourselves?"*__

## Hosting

Once you have some applications in any presentable shape or form you might want
to make it available on the *Internet* so people can find it and use it.
A cost-effective way of doing so is by hosting a server (or a few) by yourself.

I had a couple of [Raspberry Pi](https://www.raspberrypi.org) devices lying around at home and I
run this stack on one of them initially.
Once I had my *multiarch images* ready I could easily *pull* them from *Docker Hub*
on it and start it with the *Docker* daemon.  
If you're interested in *Raspberry Pi* and/or *Docker* have a look at
[this great blog from Alex Ellis](http://blog.alexellis.io) where I've got some of the ideas from for this site.

The *Raspberry Pi 3* I already had in use for other things has only an *8 GB* SD card
in it and I started to run out of space on it with all the *Docker* pulls quite quickly.
I didn't want to redo its whole setup again so I started looking for another device.

I have finally found my [Pine64](https://www.pine64.org) board hiding in a drawer not doing anything
so I decided I'll use that one for hosting services such as this site.
It has a similar *64-bit ARM* processor than the *Raspberry Pi 3* but unlike that
you can find *Linux* distributions for it that support the *64-bits* `aarch64` architecture -
as of this writing the [Raspbian OS](https://www.raspberrypi.org/downloads/raspbian) only supports *32-bits* execution.

Porting my existing *Docker images* was easy once I've set up the `arm64v8` base images.
I've enabled a new configuration in the *Travis matrix builds* and the rest continued 
working as before with `x86` and `armv7`.

Getting *Docker* on *Pine64* wasn't as easy as it is on other, more common architectures
but [Alex Ellis has a great post](http://blog.alexellis.io/get-started-with-docker-on-64-bit-arm) on how to get it up and running.

After running and updating a few containers manually I realised that this is
a lot of work and thought that I can probably do something better.

### docker-compose

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

### Proxy server

When I was looking for a solution to route requests to my apps I came across the 
brilliant [jwilder/nginx-proxy](https://github.com/jwilder/nginx-proxy) project on *GitHub*.
It is a self-contained *Docker image* that will run an *nginx proxy server* plus
a lightweight process (called *docker-gen*) that listens for *container* start and stop events 
from the *Docker daemon* and automatically reconfigures *nginx* - __*plain awesome!*__

It requires attaching the *Docker socket file* as a *volume* to the container so it
can connect to the *daemon*.
It also requires the target *containers* to *expose* their target ports and to have
the `VIRTUAL_HOST` environment variable set to the domain name we want *nginx* to
proxy the requests from.
As *containers* start or stop (or *scale*) *nginx* is automatically reloaded with 
the updated auto-generated configuration, load-balancing between multiple instances of
the same application if it runs as multiple *containers* by *scaling*.

This is great because the only thing you have to worry about is starting properly
configured *containers* and *docker-gen* will do the rest for you.
If you want to add a new application to your stack you just start it with the 
`VIRTUAL_HOST` environment variable set to the new domain name and you're done.

Having a publicly available endpoint that also has *root* access to your *Docker daemon*
is not the most secure thing ever though but the *GitHub* project suggest a nice alternative.
You can run *nginx* as the only *container* with an externally reachable port alongside an
individual [docker-gen container](https://github.com/jwilder/docker-gen) that has read-only access 
to the *daemon* and a shared *volume* with *nginx* to be able to update its configuration file.
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

  googleplay-proxy:
    image: rycus86/googleplay-proxy:aarch64
    expose:
      - "5000"
    environment:
      - VIRTUAL_HOST=gplay.api.viktoradam.net

volumes:
  nginx-config:
```

To piece it together:

- `nginx` listens on port *80* from the outside world and passes connections to port *80*
  of the running *nginx* process.
- `nginx-gen` is configured to share the configuration *volume* with it and with the name
  of the *container* to send the reload *signal* to.
  It also has read-only access to the *Docker daemon* but not any other *containers*.
- The *Flask* applications don't have *externally bound* ports, they only *expose* their
  port *5000* so *nginx* can proxy requests to them on the *Docker* virtual network.  
  They also each have their corresponding `VIRTUAL_HOST` variable set.
- The `volumes` section declares the *volume* shared by both `nginx` and `nginx-gen`.

Again, adding a new application to this stack is a matter of adding its configuration to
the *Composefile* and executing a `docker-compose up -d` command.

### Dynamic DNS

If you're looking to set up your own server (like I did) you might run into some hosting
issues if your *ISP* doesn't give you a *static IP* address.
There are good option still like [Namecheap](https://www.namecheap.com) that supports
*Dynamic DNS* - meaning you can send them your *IP* address periodically and they will
point the domain name at that address you sent.

To help you do that you can use [ddclient](https://sourceforge.net/p/ddclient/wiki/Home)
that supports quite a few *DNS providers*.  
It has a simple text-based configuration that looks something like this:
```text
use=web, web=dynamicdns.park-your-domain.com/getip
protocol=namecheap 
server=dynamicdns.park-your-domain.com 
login=sample.com
password=your dynamic dns password
test, demo, www
```

This configuration could update the *IP* addresses for:

- *test.sample.com*
- *demo.sample.com*
- *www.sample.com*

To make it easier you can also have *ddclient* in a *container*
[like this](https://github.com/rycus86/docker-ddclient) and configure it in a *Composefile*
perhaps alongside your applications.  
It would look like this:
```yaml
version: '2'
services:
  # Proxy server
  ...
  # Applications
  ...
  # DynDNS client
  ddclient:
    image: rycus86/ddclient:aarch64
    command: --daemon=300 --ssl --debug
    restart: always
    volumes: 
      - /etc/ddclient.conf:/etc/ddclient.conf:ro
```

This would run the *ddclient* and it would update your configured domains every 5 minutes.
