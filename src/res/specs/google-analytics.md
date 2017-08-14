To know about the site's visitors and their browsing experience I use
[Google Analytics](https://analytics.google.com/analytics/web/) tracking.

The basic setup is really easy.
After registering an account and your website *(for free)* you get
an identifier like `UA-123456789-1`.
Once you have that you can add a small *JavaScript* code to the end
of your pages like this:

```html
<!-- Google Analytics -->
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-123456789-1');
  ga('send', 'pageview');
</script>
```

This will send a `pageview` tracking event with the page's title and URL
every time someone is browsing it.
This allows you to know about what landing pages are performing best or
what other pages do visitors go on to check *if any*.

To know more about how the browsing experience is for your website's visitors
you can add some more *JavaScript* code to get timings of certain events.

```javascript
if (window.performance) {
    var timeSincePageLoad = Math.round(performance.now());
    ga('send', 'timing', 'JS Dependencies', 'javascript', timeSincePageLoad);

    var existingWindowOnLoad = window.onload;
    window.onload = function() {
        if (!!existingWindowOnLoad) {
            existingWindowOnLoad();
        }

        setTimeout(function() {
            var timing = window.performance.timing;
            var page_load_time = timing.loadEventEnd - timing.navigationStart;
            ga('send', 'timing', 'Page load', 'load', page_load_time);

            var connect_time = timing.responseEnd - timing.requestStart;
            ga('send', 'timing', 'Request time', 'request', connect_time);
        }, 0);
    };
}
```

If the browser supports the 
[Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
([most of them do](https://caniuse.com/#feat=user-timing))
you can get *timing* metrics on how long did it take to load the
*JavaScripts* (`JS Dependencies`) for the page or how much time did the
`Page load` or the initial request (`Request time`) take.
By default *Google Analytics* tracks this for *1%* of the visitors but you
can tweak it by changing the initialization code like this:

```javascript
ga('create', 'UA-123456789-1', {'siteSpeedSampleRate': 100});
```

This will track *all* your visitors' browser timings.
You can track any sorts of events, for example the time it takes to
*lazy-load* certain parts of the website with a simple instruction like this:

```javascript
ga('send', 'timing', title, label, end_time - start_time);
```

Once you gathered some data about the visitors log in to the dashboard
to analyze the results.

![Google Analytics]({{ image: google-analytics.png }})

