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
