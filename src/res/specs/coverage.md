It sounds like a good idea to know if you're code is well covered by tests, right?

In *Python* this is very easy with the [coverage.py](https://coverage.readthedocs.io/en/latest/) module.
To install, simply run:  
`pip install coverage`

To measure test coverage while running the same tests above run:  
```shell
PYTHONPATH=src python                     \
    -m coverage run --branch --source=src \
    -m unittest discover -s tests -v
```
This will execute the same tests as above but recording code coverage metrics too this time.
By default, these will be saved in a `.coverage` file - make sure you have that in your `.gitignore`.

To print the results after collecting the metrics you can run:  
`python -m coverage report -m`

This outputs something like this:
```shell
$ python -m coverage report -m
Name         Stmts   Miss Branch BrPart  Cover   Missing
--------------------------------------------------------
src/app.py      47      2     10      1    95%   82, 86, 85->86
```

Not very high-tech or 2017-flashy in terms of displaying the results
but you have your percentage of covered lines there plus the line numbers of the missing ones.  
We can do better though.
