For *Python* projects one of the easiest ways to have unit tests is with the official, pre-installed
[unittest](https://docs.python.org/2/library/unittest.html) module.

Running all your tests is easy:  
`PYTHONPATH=src python -m unittest discover -s tests -v`  
This assumes you're running the command from your project's root directory where the
actual sources are in the `src` folder and the tests in the `tests` folder.
