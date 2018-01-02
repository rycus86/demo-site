My initial update strategy used to be simple.
I had one server running the site and its related services using *docker-compose*.
Every 15 minutes a *cron* job would fetch the latest configuration from a private
*BitBucket* repository, run `docker-compose pull` to update the *images* from
*Docker Hub* and execute `docker-compose up -d` to restart the changed services.

I have since switched to 3 server nodes forming a *Swarm* cluster.
Whenever a new *image* is pushed to *Docker Hub* it will send a *webhook* request
to a public-facing [webhook-proxy](https://github.com/rycus86/webhook-proxy) instance.
This validates it and on success it sends the required details to another (internal)
*webhook* processor instance.
That will pull the latest image, get its hash and update the related service(s)
to use the new image tag.
This allows me to leverage *Swarm's* rolling update mechanism.

For configuration updates happening in the private repository, the *Git* repository
is pulled, services related to changed configuration files are restarted and finally
the *stack* is updated using `docker stack deploy <stack_name>` to ensure any
changes in the *YAML* file are applied.

The update process has changed considerably since I've started working on the stack
but the ultimate goal hasn't: it allows me to forget about *everything*
needed to get my changes live - the __only thing__ I have to do is `git push`.

Now that we have our services up and running we should keep track of how they are doing.
It is time to add some monitoring for the stack!
