Once you have some applications in any presentable shape or form you might want
to make it available on the *Internet* so people can find it and use it.
A cost-effective way of doing so is by hosting a server (or a few) by yourself.

I had a couple of [Raspberry Pi](https://www.raspberrypi.org) devices lying around at home and I
run this stack on one of them initially.
Once I had my *multiarch images* ready I could easily *pull* them from *Docker Hub*
on it and start it with the *Docker* daemon.  
If you're interested in *Raspberry Pi* and/or *Docker* have a look at
[this great blog from Alex Ellis](https://blog.alexellis.io) where I've got some of the ideas from for this site.

The *Raspberry Pi 3* I already had in use for other things has only an *8 GB* SD card
in it and I started to run out of space on it with all the *Docker* pulls quite quickly.
I didn't want to redo its whole setup again so I started looking for another device.

I have finally found my [Pine64](https://www.pine64.org) board hiding in a drawer not doing anything
so I decided I'll use that one for hosting services such as this site.
It has a similar *64-bit ARM* processor than the *Raspberry Pi 3* but unlike that
you can find *Linux* distributions for it that support the *64-bits* `aarch64` architecture -
as of this writing the [Raspbian OS](https://www.raspberrypi.org/downloads/raspbian/) only supports *32-bits* execution.

Porting my existing *Docker images* was easy once I've set up the `arm64v8` base images.
I've enabled a new configuration in the *Travis matrix builds* and the rest continued 
working as before with `x86` and `armv7`.

Getting *Docker* on *Pine64* wasn't as easy as it is on other, more common architectures
but [Alex Ellis has a great post](https://blog.alexellis.io/get-started-with-docker-on-64-bit-arm) on how to get it up and running.

After running and updating a few containers manually I realised that this is
a lot of work and thought that I can probably do something better.
