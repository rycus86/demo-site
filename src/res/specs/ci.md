Testing the application, measuring it's quality and building the production binary
is what continuous integration means to me for this project.  
Luckily there are free services available to do all of these for open-source projects.

## Prepare

Testing starts even before the code is submitted to remote services with a `git commit`.
I use a simple [git pre-commit hook](https://github.com/rycus86/demo-site/blob/master/.pre-commit.sh)
to check that I don't commit something I know won't build successfully or
would contain *debug* settings only meaningful for local development.

Setting it up is quite easy. Have an executable file (like *Shell* script) 
in your project root (__*.pre-commit.sh*__ for example) then run:  
`ln -s ../../.pre-commit-sh .git/hooks/pre-commit`  
You'll have to do this once - though on each machine you clone the *git* project to.
You can (and should) check in your *git hook scripts* into version control but
unfortunately you cannot automatically register them with *git* locally.

This gives you a nice *fail-fast* way of doing some sanity-checks on your codebase
but you'll probably want to repeat most of the steps in a *CI* service too - in case
a change is submitted without having the *git* hooks in place or with `git commit --no-verify`.

## Testing

For *Python* projects one of the easiest ways to have unit tests is with the official, pre-installed
[unittest](https://docs.python.org/2/library/unittest.html) module.

Running all your tests is easy:  
`PYTHONPATH=src python -m unittest discover -s tests -v`  
This assumes you're running the command from your project's root directory where the
actual sources are in the `src` folder and the tests in the `tests` folder.

## Measuring quality

It sounds like a good idea to know if you're code is well covered by tests, right?

In *Python* this is very easy with the [coverage.py](https://coverage.readthedocs.io/en/latest/) module.
To install, simply run:  
`pip install coverage`

To measure test coverage while running the same tests above run:  
```bash
PYTHONPATH=src python                     \
    -m coverage run --branch --source=src \
    -m unittest discover -s tests -v
```
This will execute the same tests as above but recording code coverage metrics too this time.
By default, these will be saved in a `.coverage` file - make sure you have that in your `.gitignore`.

To print the results after collecting the metrics you can run:  
`python -m coverage report -m`

This outputs something like this:
```bash
$ python -m coverage report -m
Name         Stmts   Miss Branch BrPart  Cover   Missing
--------------------------------------------------------
src/app.py      47      2     10      1    95%   82, 86, 85->86
```

Not very high-tech or 2017-flashy in terms of displaying the results
but you have your percentage of covered lines there plus the line numbers of the missing ones.  
We can do better though.

## Visualising quality

There are some pretty nice *free-for-open-source* services out there which
can help you present this data in an easy-to-digest format and on a nice *UI*.

### Coveralls

For code coverage I use [Coveralls](https://coveralls.io).

![Coveralls]({{ image: coveralls.png }})

This platform provides a nice timeline of overall code coverage as well as 
line-by-line markup of each source file clearly displaying which lines aren't covered by tests.  
As an added bonus, you can also get neat coverage badges on your *README* files like this:
[![Coverage Status](https://coveralls.io/repos/github/rycus86/demo-site/badge.svg?branch=master)](https://coveralls.io/github/rycus86/demo-site?branch=master)

As I mentioned, this service is free to use for open-source projects 
and you can sign up with your *GitHub* account.
Assuming you use *Travis* (more on *Travis* later) sending your code coverage metrics is as easy as:
```bash
$ pip install coveralls
... run coverage ...
$ coveralls
```

If you want, you can also set up automatic email, Slack, etc. 
notifications when your code coverage drops (or increases) so you would know 
about it automatically without actively checking.

### Code Climate

[Code Climate](https://codeclimate.com) does code coverage too but it also provides
static code analysis to reveal duplicated code or code style issues and much more.

![Code Climate]({{ image: code-climate.png }})

Your source files get graded *(from A to F)* dependending on how many issues 
they contain and how severe those are.
The issues can be viewed inside the platform or you can install a [Chrome extension](https://codeclimate.com/browser-extension/)
and see the code analysis and coverage metrics directly in *GitHub*, nice.  
This service also provides all sorts of notification hooks and other integrations.

Set-up is a bit more fiddly:
```bash
$ export CC_TEST_REPORTER_ID=<your token>
$ curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
$ chmod +x ./cc-test-reporter
... run coverage ...
$ ./cc-test-reporter after-build --exit-code $?
```

The first three lines set the *Code Climate* test reporter *ID*, download the reporting tool
and make it executable.
The last line takes care of sending the actual metrics along with the build's exit code.  

*Note* for *Python*: you'll need to have *XML* coverage reports from the *coverage.py* module.

If you got all of the above right then here are your well-deserved badges:  
[![Code Climate](https://codeclimate.com/github/rycus86/demo-site/badges/gpa.svg)](https://codeclimate.com/github/rycus86/demo-site)
[![Test Coverage](https://codeclimate.com/github/rycus86/demo-site/badges/coverage.svg)](https://codeclimate.com/github/rycus86/demo-site/coverage)
[![Issue Count](https://codeclimate.com/github/rycus86/demo-site/badges/issue_count.svg)](https://codeclimate.com/github/rycus86/demo-site/issues)

## Travis CI

All right, this all sounds good so far but how do I do this *automatically* in a
*reliable* and __*repeatable*__ way *every time* I push changes to my project?  
This is where *Travis* comes in.

![Travis CI]({{ image: travis-ci.png }})

*Travis CI* is a *continuous integration* service that allows you to run
complex build (and deployment) plans for your project.  
It is also free for open-source projects and you can sign up with your *GitHub* account.

If you're familiar with [Jenkins](https://jenkins.io) or [Bamboo](https://www.atlassian.com/software/bamboo)
then *Travis* is not dissimilar to them but it is hosted in the cloud - and did I mention it's __*free*__?

It can automatically start new builds whenever there is a new commit in your 
*GitHub* project and run it using default settings based on the auto-detected settings
but for most use-cases you'll want to have your own build process described in a `.travis.yml` file.  
You can see my [.travis.yml file](https://github.com/rycus86/demo-site/blob/master/.travis.yml) here as an example.

The main elements in the *YAML* file are:
- *language*: the main programming language of your project
- *install*: running installation instructions on the build environment
- *before_script*: build preparation
- *script*: the actual build instructions
- *after_success*: any final steps after a successful build
- *env*: environment variables to pass to the build

Taking a *Python* application as an example, let's see an example of putting together all the steps above:
```yaml
language: python
python:
  - '2.7'
install:
  - pip install -r requirements.txt
  - pip install coveralls
before_script:
  - curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
  - chmod +x ./cc-test-reporter
script:
  # python tests
  - PYTHONPATH=src python -m coverage run --branch --source=src -m unittest discover -s tests -v
after_success:
  # coverage reports
  - coveralls
  - python -m coverage report -m
  - python -m coverage xml
  - ./cc-test-reporter after-build --exit-code $TRAVIS_TEST_RESULT
env:
  - CC_TEST_REPORTER_ID=1234abcd
```

This build plan will:

- Initialize the build environment for *Python* version *2.7* 
and set an environment variable for *Code Climate* reporting.
- The `install` step will fetch the libraries required by the application plus the 
*Coveralls* reporting tool.
- In the `before_script` section we download and prepare the *Code Climate* reporter.
- The `script` step is the actual command (can be more than one) that makes our build
*pass* or *fail*.
- Given the build was successful, the `after_success` section will prepare and print
the coverage report and send it to *Coveralls* and *Code Climate*.

*Easy.*

*Travis* supports quite a few languages and can integrate with lots of other services.  
You can get it to publish your built binaries or documentation somewhere like [PyPI](https://pypi.python.org/pypi), 
deploy your application to *AWS*, *Heroku*, *Google App Engine* or others and you can also 
build *Docker* images and upload them to [Docker Hub](https://hub.docker.com) - 
more on this in the *Continuous deployment* section.

Another great feature is the [Matrix builds](https://docs.travis-ci.com/user/build-stages/matrix-expansion/) 
that allows you to have a build plan run multiple times for the same *git commit* but with different settings.
For example, you might want to build your *Python* project on version *2.7* and *3.5*
or you want to build multiple *Docker* images with different tags and/or different *Dockerfiles*.  
*Travis* allows you to do this in an easy and intuitive way.
Certain build sections (like `python:` above) treat multiple values as input for a matrix build, for example:
```yaml
language: python
python:
  - '2.7'
  - '3.5'
```

This will cause your build plan to spin up 2 workers on changes, one for each *Python* version.
A more generic approach is to define *matrix* environment variables:
```yaml
...
env:
  matrix:
  - DOCKER_TAG=latest  DOCKERFILE=Dockerfile
  - DOCKER_TAG=alpine  DOCKERFILE=Dockerfile.alpine
```

This for example could be input for a *Docker* build to create a standard 
and a small version of the image but otherwise using the same build plan.

You can use both approaches in the same build plan and the combination of all
*matrix* variables will be used to start builds - 
this might end up being a large number for lots of *matrix* variables.

*Travis* will send you emails about broken and fixed builds by default
but you can get notifications on a wide range of other channels too.

And of course, we can't forget about our belowed badge either:
[![Build Status](https://travis-ci.org/rycus86/demo-site.svg?branch=master)](https://travis-ci.org/rycus86/demo-site)

