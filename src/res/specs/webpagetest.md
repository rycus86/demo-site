Another great tool to measure your website's performance is
[webpagetest.org](https://www.webpagetest.org).

This site allows you to run tests that fetch a page on your website and
collect all sorts of metrics useful to know where to focus for optimization.
They can run these tests using the most popular browsers and from many
locations all around the world.
This is especially useful to see how latency hurts the user experience.

![Webpagetest options]({{ image: webpagetest-options.png }})

The results are now presented in useful tables and graphs but screenshots
and a video is also available on how the page was loaded in the browser.

![Webpagetest result]({{ image: webpagetest-waterfall.png }})

The site gives you a score too and offers helpful hints on what areas
need improvement.

This site has helped me identifying some bottlenecks.
Based on the information and the suggestions I am now:

- Using a *Content Delivery Network* (see in a following section)
- Sending *HTTP/2 preload* headers for *CSS* and *JavaScript*
- Inlining some of the *CSS* to avoid sending it as *2* additional files
- Hosting the fonts on my server behind the *CDN*
- Lazy-loading images
- Sending better cache headers

This has helped me to reduce the page load time from certain locations
from close to __*10 seconds*__ to about __*3 seconds*__.  
*Not too bad.*
