For code coverage I use [Coveralls](https://coveralls.io).

![Coveralls]({{ image: coveralls.png }})

This platform provides a nice timeline of overall code coverage as well as 
line-by-line markup of each source file clearly displaying which lines aren't covered by tests.  
As an added bonus, you can also get neat coverage badges on your *README* files like this:
[![Coverage Status](https://coveralls.io/repos/github/rycus86/demo-site/badge.svg?branch=master)](https://coveralls.io/github/rycus86/demo-site?branch=master)

As I mentioned, this service is free to use for open-source projects 
and you can sign up with your *GitHub* account.
Assuming you use *Travis* (more on *Travis* later) sending your code coverage metrics is as easy as:
```shell
$ pip install coveralls
... run coverage ...
$ coveralls
```

If you want, you can also set up automatic email, Slack, etc. 
notifications when your code coverage drops (or increases) so you would know 
about it automatically without actively checking.
