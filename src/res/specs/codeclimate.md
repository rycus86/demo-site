[Code Climate](https://codeclimate.com) does code coverage too but it also provides
static code analysis to reveal duplicated code or code style issues and much more.

![Code Climate]({{ image: code-climate.png }})

Your source files get graded *(from A to F)* depending on how many issues 
they contain and how severe those are.
The issues can be viewed inside the platform or you can install a [Chrome extension](https://codeclimate.com/browser-extension/)
and see the code analysis and coverage metrics directly in *GitHub*, nice.  
This service also provides all sorts of notification hooks and other integrations.

Set-up is a bit more fiddly:
```shell
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
