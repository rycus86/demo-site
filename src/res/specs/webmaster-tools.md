Now that you have tracking on the website you might find out that people
*don't actually find it*.
Getting your pages to show up in *Google* search results could greatly
improve your chances though and it's easy to get started with it.

You can register your website on
[Google Webmasters Tool](https://www.google.com/webmasters/tools)
*(for free)* to get their *crawler* to index it.
It will also display useful statistics about how often do your pages show up
in search results, for what queries and how many times people click on those
links to get to the site.
This could also help optimizing the website to make it more appealing in the
search results if you find that people don't navigate to it even if it does
show up on the list often.

To get started, *Google* needs to verify that you manage the website.
There are multiple ways to do it but having *Google Analytics* set up already
you can get the system to verify that the website has tracking code on it
associated with your account.

You can see useful metrics and information about how the *crawler* interprets
your site, how often does it check it or any issues it has identified.

![Search crawler]({{ image: search-crawler.png }})

Once your pages are getting indexed and start showing up in the
search results, you can find statistics about them in the dashboard.

![Search traffic]({{ image: search-impressions.png }})

You can influence your pages look like in the search result.
To control the basics, make sure you have short and meaningful titles in the
`<title>` tags and have a nice summary of the content in the description as:

```html
<meta name="description" content="...">
```

If you can refer to your pages with multiple URLs, you might want to also
add canonical links to them to tell *Google* that they are the same and
which URL is your preferred one.

```html
<!-- Make sure to use absolute URLs here. -->
<link rel="canonical" href="https://my.site.com/preferred/url"/>
```

There are a number of factors influencing the *ranking* of the pages
including having relevant and frequently updated content on them.
Other metrics like time spent on the site by visitors and
*bounce rate* might also have an effect on it.

Both visitors and *Google* takes into consideration how quickly they
can load pages of the website so let's run some tests to find out!
