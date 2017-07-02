All right, this all sounds good so far but how do I do this *automatically* in a
*reliable* and __*repeatable*__ way *every time* I push changes to my project?  
This is where *Travis* comes in.

![Travis CI]({{ image: travis-ci.png }})

[Travis CI](https://travis-ci.org) is a *continuous integration* service that allows 
you to run complex build (and deployment) plans for your project.  
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
build *Docker* images and upload them to [Docker Hub](https://hub.docker.com).

You can also get a command line [client application](https://github.com/travis-ci/travis.rb)
for *Travis* that lets you do simple tasks without having to open up the web UI.
This includes getting build statuses, restarting builds or encrypting files or
variables for example.
If you're like me and don't want to install this tool and its dependencies but
still want to use it then have a look at my [docker-travis-cli](https://github.com/rycus86/docker-travis-cli)
project that allows you to do exactly this by only installing a *Bash* script
to execute the *Travis* commands using a *Docker* image.

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

And of course, we can't forget about our beloved badge either:  
[![Build Status](https://travis-ci.org/rycus86/demo-site.svg?branch=master)](https://travis-ci.org/rycus86/demo-site)
