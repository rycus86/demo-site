If you're looking to set up your own server (like I did) you might run into some hosting
issues if your *ISP* doesn't give you a *static IP* address.
There are good option still like [Namecheap](https://www.namecheap.com) that supports
*Dynamic DNS* - meaning you can send them your *IP* address periodically and they will
point the domain name at that address you sent.

To help you do that you can use [ddclient](https://sourceforge.net/p/ddclient/wiki/Home/)
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
