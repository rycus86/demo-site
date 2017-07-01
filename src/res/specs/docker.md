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

RUN adduser -S webapp
USER webapp

ADD src /app
WORKDIR /app

CMD [ "python", "app.py" ]
```

The *container* running this site starts `FROM` a *base image* called `alpine`,
the super-small [Alpine Linux](https://alpinelinux.org) distribution that is 
ideal for building (and transferring) *images* based on them.  
The `RUN` instruction executes *Shell* commands like you would do if you would do this
on an actual server the old-fashioned way.  
`USER` changes the *Unix user* the container will run the main process with.
This is a good idea in general to reduce the attack surface your web application
(and its container) has.  
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
