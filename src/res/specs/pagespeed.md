Once you have some metrics about browser timings from your site's visitors,
you might find that the experience is not that great when you're not connecting
to the site on *localhost* on your laptop.

A great tool that can help you identify some of the problems is *Google's*
[PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights)
that processes a page on your website and analyzes its performance from both
mobile and desktop perspective.
It also gives you helpful hints on how to resolve those problems.

![PageSpeed Insights]({{ image: pagespeed.png }})

You only need to enter the *URL* of the page you're looking to get more
information about and hit the *Analyze* button.
On my demo site I've got a few helpful tips on how to make it faster.

##### Browser caching

The static resources like images, *JavaScript* and *CSS* files where
served without or not long-enough cache expiration headers.
I have changed this easily to *1 month* in *Flask* using a simple configuration.

```python
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 30 * 24 * 60 * 60  # 1 month
```

##### Optimize images

Optimizing images was an easy win since most of my images were screenshots
saved as is so there was definitely room for improvement.
*PageSpeed Insight* lets you download the optimized version of your images
or you can use any tools you like.

##### Eliminate render-blocking resources

The browser will not be able to render the page if it has resources to download
before the content, usually in the `<head>` section of the *HTML*.
For *JavaScript* you can try the `async` attribute on the `<script>` tag though
be aware that the scripts will be downloaded *and executed* in random order so,
if you have dependencies between your scripts, this might be tricky.
I opted for using the `defer` attribute which delays loading the *JavaScript* files
until after the page has finished parsing.

*CSS* was a bit trickier since you would normally want the content on the page
to appear looking nice so these usually live in the `<head>` section.
Still, you might have styles that *can* be loaded later, for content not visible
at first glance or elements that are lazy loaded.
I have changed my `<link>` tags loading non-critical *CSS* to:

```html
<meta name="custom-fetch-css" content="/asset/non-critical.css"/>
```

These are then turned into regular `<link>` tags with *JavaScript* once those are
loaded:

```javascript
lazyLoadCSS: function () {
    $('meta[name=custom-fetch-css]').each(function () {
        var placeholder = $(this);
        var href = placeholder.attr('content');
        
        placeholder.replaceWith(
            $('<link>').attr('rel', 'stylesheet')
                       .attr('href', href)
                       .attr('type', 'text/css'));
    });
}
```

##### Enable compression

I could easily enable this in *nginx* as described already with a little
bit of configuration.

```
http {
  ...
  gzip on;
  ..
}

server {
	gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript image/svg+xml;
    ...
}
```

##### Other hints

My site's results were getting better in *PageSpeed Insights* but there were
still some more things to improve:

- Reduce server response time
- Minify HTML
- Minify CSS
- Minify JavaScript

One could use the [PageSpeed Module](https://developers.google.com/speed/pagespeed/module)
as suggested by the tool which is an add-on for *Apache* or *nginx* webservers.
I did not want to install additional modules on mine though so I have opted for
a different approach.
