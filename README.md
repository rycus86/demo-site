# Demo website

A website to showcase an example of creating a set of applications 
built, tested and deployed completely with open-source and free tools.

Most of the backend services are `Python` [Flask](http://flask.pocoo.org) applications 
while the frontend uses the [Material Design Lite](https://getmdl.io/index.html) library 
with [jQuery](https://jquery.com).

All backend services are built into [Docker](https://www.docker.com) images
on [Travis CI](https://travis-ci.org) 
then pulled to a [Pine64](https://www.pine64.org/?page_id=1194) server
where they are running behind an [nginx](https://nginx.org/en) proxy server.

The whole process including the deployments is automated,
the only manual step being the `git push` command.

To see it in action and find out how it works [go to the demo site](https://demo.viktoradam.net).
