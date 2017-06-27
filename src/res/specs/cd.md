By *continuous deployment* I mean that after a `git push` you don't have to do
anything manual to get a successful build onto the target server - 
it should happen __*automatically*__.  
Apart from running or hosting an actual server this can be done for free as well,
let's see how.

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
While you're there, make sure to have a look at [best practises](https://docs.docker.com/engine/userguide/eng-image/dockerfile_best-practices) for writing *Dockerfiles*.

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
for the most common `x64` (or `x86`) architecture - 
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

- __Dockerfile__: for `x64` hosts
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
  - docker login -u="rycus86" -p="$DOCKER_PASSWORD"
  - >
    if [ "$DOCKER_PUSH" == "yes" ]; then
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
For example on the `x64` *Travis* hosts we can run executables compiled for *ARM* 
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

To give credit, this is based on the great work the [Hypriot team documented](https://blog.hypriot.com/post/setup-simple-ci-pipeline-for-arm-images)
even though it looks like people have [come up with this](https://github.com/travis-ci/travis-ci/issues/3376) back in late 2015.

OK, great, this is working nicely again but the question still stands:
__*"why would we even want to do this to ourselves?"*__

## Hosting

Once you have some applications in any presentable shape or form you might want
to make it available on the *Internet* so people can find it and use it.
A cost-effective way of doing so is by hosting a server (or a few) by yourself.

I had a couple of [Raspberry Pi](todo:link) devices lying around at home and I
run this stack on one of them initially.
Once I had my *multiarch images* ready I could easily *pull* them from *Docker Hub*
on it and start it with the *Docker* daemon.  
If you're interested in *Raspberry Pi* and/or *Docker* have a look at
[this great blog from Alex Ellis](todo:link) where I've got some of the ideas from for this site.

The *Raspberry Pi 3* I already had in use for other things has only an *8 GB* SD card
in it and I started to run out of space on it with all the *Docker* pulls quite quickly.
I didn't want to redo its whole setup again so I started looking for another device.

I have finally found my [Pine64](todo:link) board hiding in a drawer not doing anything
so I decided I'll use that one for hosting services such as this site.
It has a similar *64-bit ARM* processor than the *Raspberry Pi 3* but unlike that
you can find *Linux* distributions for it that support the *64-bits* `aarch64` architecture -
as of this writing the [Raspbian OS](todo:link) only supports *32-bits* execution.

Porting my existing *Docker images* was easy once I've set up the `arm64v8` base images.
I've enabled a new configuration in the *Travis matrix builds* and the rest continued 
working as before with `x64` and `armv7`.

Getting *Docker* on *Pine64* wasn't as easy as it is on other, more common architectures
but [Alex Ellis has a great post](todo:link) on how to get it up and running.

After running and updating a few containers manually I realised that this is
a lot of work and thought that I can probably do something better.

### docker-compose

