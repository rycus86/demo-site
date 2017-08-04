My main problem with my *self-hosted server* is that its response time is limited
by my internet connection speed - which is not enterprise-grade by any measure.
Response times are mostly OK from within the *UK* but the further you go the worse it gets.

The solution to the problem are [Content Delivery Networks](https://en.wikipedia.org/wiki/Content_delivery_network).
These provide a geographically distributed service to *proxy* your web content
with the goal of reducing the latency by serving the data from a server close to
the end user.

[Cloudflare](https://www.cloudflare.com) offers a *free* plan that gives you a
global *CDN* with *SSL*, caching, analytics and *much more*.

On the initial setup, I needed to change the *DNS servers* on *Namecheap* to use
the ones provided by *Cloudflare* instead of their own.
This change could take *1 or 2 days* according to them but for me it has actually
happened within minutes.

Apart from serving the response closer to the user what does *Cloudflare* give me?

##### End-to-end encryption

With the `Full (strict)` *SSL* setting the visitors use the new *Cloudflare*
certificates while it fetches the content from my *origin* server using its
*LetsEncrypt* certificates.

##### Auto Minify content

A great feature: with a matter of checking some checkboxes my *HTML*, *JavaScript*
and *CSS* content is now served *minified* without having to do it on the *origin*
server.

##### Caching

You can get *Cloudfare* to cache content for a certain amount of time and
add appropriate *cache headers* on the responses to get the browser to cache
content for some time too.
For example, you could get the *edge servers* to cache everything for *2 hours*
and tell the browser to cache content locally for *1 hour*.

This setting actually needed using *1 of the 3* free *Page Rules*.
The configuration I am using is:

- *Cache Level*: Cache Everything
- *Browser Cache TTL*: 1 hour
- *Edge Cache TTL*: 2 hours

You can also *purge* cached content on the dashboard or using their *API*
if you need to make an update visible quickly.

##### HTTP/2 Push

[HTTP/2 Push](https://en.wikipedia.org/wiki/HTTP/2_Server_Push) is a great
feature of the new version of the protocol.
It allows the web server to send resources to the browser *before* it would
realise it will need them, for example *CSS* or *JavaScript* files included
in the response document. 

Unfortunately, *nginx* does not support this in the *community* version, only
in the *paid Plus* version so I could not use it easily.
*Cloudflare* does handle them though beautifully and all you need to do is
send *HTTP headers* like these in the response:

```
Link: </asset/some-style.css>; rel=preload; as=style
Link: </asset/some-script.js>; rel=preload; as=script
```

In my *Flask* application I have a *dictionary* of the static assets so
the code to prepare these headers looks like this:

```python
for name, link in assets.items():
    if name.endswith('.css'):
        response.headers.add('Link', '<%s>; rel=preload; as=style' % link)

    elif name.endswith('.js'):
        response.headers.add('Link', '<%s>; rel=preload; as=script' % link)
```
