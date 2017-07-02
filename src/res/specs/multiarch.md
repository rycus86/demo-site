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
