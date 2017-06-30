To have the site and its related services update automatically I use *cron* with a 
*Shell script* - for now.
Every 15 minutes the script does the following:

- Fetches the latest configuration of the stack from a private *BitBucket* repository
- Runs `docker-compose pull --ignore-pull-failures` to update the *images* from *Docker Hub*
- Executes `docker-compose up -d` to restart the services that have changed

The last step will only restart (recreate) *containers* where either the *image* has
been updated or the corresponding *Composefile* configuration has changed.
All other services are unaffected and continue to run as they did so far.

This process is very basic at the moment but it does allow me to forget about *everything*
needed to get my changes live - the only thing I have to do is `git push`.
