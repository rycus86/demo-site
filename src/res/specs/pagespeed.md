Once you have some metrics about browser timings from your site's visitors,
you might find that the experience is not that great when you're not connecting
to the site on *localhost* on your laptop.

A great tool that can help you identify some of the problems is *Google's*
[Pagespeed Insights](todo:link)
that processes a page on your website and analyzes its performance from both
mobile and desktop perspective.
It also gives you helpful hints on how to resolve those problems.

    TODO insert image of a result page

You only need to enter the *URL* of the page you're looking to get more
information about and hit *Send??*.
On my demo site I've got a few helpful tips on how to make it faster.

- Browser caching
- Asset minification
- Render-blocking resources
- others?
- Response time (internal cache / nginx / CDN)

